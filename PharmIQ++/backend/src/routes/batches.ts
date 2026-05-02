import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const batchSchema = z.object({
  medicineId: z.string(),
  batchNumber: z.string(),
  expiryDate: z.string().datetime(),
  manufacturingDate: z.string().datetime().optional(),
  quantity: z.number().int().positive(),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  supplierId: z.string(),
  invoiceId: z.string().optional(),
});

// GET all batches
router.get('/', async (req: AuthRequest, res: Response) => {
  const batches = await prisma.batch.findMany({
    where: { tenantId: req.tenantId },
    include: {
      medicine: true,
      supplier: true,
    },
    orderBy: { expiryDate: 'asc' },
  });

  res.json(batches);
});

// CREATE batch
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = batchSchema.parse(req.body);

  const batch = await prisma.batch.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
      expiryDate: new Date(data.expiryDate),
      manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });

  res.status(201).json(batch);
});

// UPDATE batch quantity
router.patch('/:id/quantity', async (req: AuthRequest, res: Response) => {
  const { quantity } = z.object({ quantity: z.number().int() }).parse(req.body);

  const batch = await prisma.batch.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data: { quantity },
  });

  if (batch.count === 0) {
    throw new AppError('Batch not found', 404);
  }

  const updated = await prisma.batch.findUnique({
    where: { id: req.params.id },
    include: { medicine: true, supplier: true },
  });

  res.json(updated);
});

// GET low stock batches
router.get('/stock/low', async (req: AuthRequest, res: Response) => {
  const batches = await prisma.batch.findMany({
    where: {
      tenantId: req.tenantId,
      quantity: { lte: 10 },
    },
    include: {
      medicine: true,
      supplier: true,
    },
    orderBy: [{ quantity: 'asc' }, { expiryDate: 'asc' }],
  });

  res.json(batches);
});

// GET expired/expiring batches
router.get('/expiry/alert', async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const batches = await prisma.batch.findMany({
    where: {
      tenantId: req.tenantId,
      expiryDate: { lte: thirtyDaysFromNow },
      quantity: { gt: 0 },
    },
    include: {
      medicine: true,
      supplier: true,
    },
    orderBy: { expiryDate: 'asc' },
  });

  res.json(batches);
});

// GET batch by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const batch = await prisma.batch.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      medicine: true,
      supplier: true,
    },
  });

  if (!batch) {
    throw new AppError('Batch not found', 404);
  }

  res.json(batch);
});

export default router;
