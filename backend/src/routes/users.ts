import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'PHARMACIST', 'CASHIER', 'MANAGER', 'VIEWER']).default('PHARMACIST'),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'PHARMACIST', 'CASHIER', 'MANAGER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

// GET all users in tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  // Only admins can view all users
  if (req.role !== 'ADMIN') {
    throw new AppError('Only admins can view all users', 403);
  }

  const users = await prisma.user.findMany({
    where: { tenantId: req.tenantId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  res.json(users);
});

// GET user by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

// CREATE user (admin only)
router.post('/', async (req: AuthRequest, res: Response) => {
  if (req.role !== 'ADMIN') {
    throw new AppError('Only admins can create users', 403);
  }

  const data = userSchema.parse(req.body);

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: {
      email: data.email,
      tenantId: req.tenantId,
    },
  });

  if (existing) {
    throw new AppError('User with this email already exists', 400);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      passwordHash,
      tenantId: req.tenantId!,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.status(201).json(user);
});

// UPDATE user
router.put('/:id', async (req: AuthRequest, res: Response) => {
  // Only admins or the user themselves can update
  if (req.role !== 'ADMIN' && req.userId !== req.params.id) {
    throw new AppError('Only admins or the user can update this profile', 403);
  }

  const data = updateUserSchema.parse(req.body);

  const user = await prisma.user.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data,
  });

  if (user.count === 0) {
    throw new AppError('User not found', 404);
  }

  const updated = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.json(updated);
});

// Change password
router.post('/:id/change-password', async (req: AuthRequest, res: Response) => {
  // Only the user can change their own password, or admins
  if (req.role !== 'ADMIN' && req.userId !== req.params.id) {
    throw new AppError('You can only change your own password', 403);
  }

  const { currentPassword, newPassword } = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }).parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({ message: 'Password changed successfully' });
});

// Deactivate user (admin only)
router.post('/:id/deactivate', async (req: AuthRequest, res: Response) => {
  if (req.role !== 'ADMIN') {
    throw new AppError('Only admins can deactivate users', 403);
  }

  if (req.params.id === req.userId) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await prisma.user.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data: { isActive: false },
  });

  if (user.count === 0) {
    throw new AppError('User not found', 404);
  }

  res.json({ message: 'User deactivated successfully' });
});

// Reactivate user (admin only)
router.post('/:id/reactivate', async (req: AuthRequest, res: Response) => {
  if (req.role !== 'ADMIN') {
    throw new AppError('Only admins can reactivate users', 403);
  }

  const user = await prisma.user.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data: { isActive: true },
  });

  if (user.count === 0) {
    throw new AppError('User not found', 404);
  }

  res.json({ message: 'User reactivated successfully' });
});

export default router;
