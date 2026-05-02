import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'INSTITUTIONAL']).default('RETAIL'),
  loyaltyPoints: z.number().int().nonnegative().optional(),
});

// GET all customers
router.get('/', async (req: AuthRequest, res: Response) => {
  const customers = await prisma.customer.findMany({
    where: { tenantId: req.tenantId },
    include: {
      prescriptions: { select: { id: true } },
      transactions: { select: { id: true } },
    },
  });

  res.json(customers);
});

// CREATE customer
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = customerSchema.parse(req.body);

  const customer = await prisma.customer.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json(customer);
});

// UPDATE customer
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const data = customerSchema.partial().parse(req.body);

  const customer = await prisma.customer.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data,
  });

  if (customer.count === 0) {
    throw new AppError('Customer not found', 404);
  }

  const updated = await prisma.customer.findUnique({
    where: { id: req.params.id },
  });

  res.json(updated);
});

// GET customer purchase history
router.get('/:id/history', async (req: AuthRequest, res: Response) => {
  const transactions = await prisma.pOSTransaction.findMany({
    where: {
      customerId: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      items: {
        include: {
          batch: {
            include: { medicine: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(transactions);
});

// Search customers
router.get('/search/:query', async (req: AuthRequest, res: Response) => {
  const customers = await prisma.customer.findMany({
    where: {
      tenantId: req.tenantId,
      OR: [
        { name: { contains: req.params.query, mode: 'insensitive' } },
        { phone: { contains: req.params.query } },
        { email: { contains: req.params.query, mode: 'insensitive' } },
      ],
    },
    take: 10,
  });

  res.json(customers);
});

// GET customer by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      prescriptions: true,
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  res.json(customer);
});

export default router;
