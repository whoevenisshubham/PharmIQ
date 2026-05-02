import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const medicineSchema = z.object({
  name: z.string().min(1),
  generic: z.string().min(1),
  category: z.string().default('General'),
  packSize: z.string().default('1 unit'),
  manufacturer: z.string().default('Unknown'),
  composition: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().default('tablet'),
  hsnCode: z.string().optional(),
  gstRate: z.number().default(5),
  scheduleType: z.enum(['GENERAL', 'SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X', 'SCHEDULE_Y']).default('GENERAL'),
  requiresPrescription: z.boolean().default(false),
  minStockLevel: z.number().default(10),
  reorderLevel: z.number().default(20),
});

// GET all medicines
router.get('/', async (req: AuthRequest, res: Response) => {
  const medicines = await prisma.medicine.findMany({
    where: { tenantId: req.tenantId },
    include: {
      batches: {
        where: { quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
      },
    },
  });

  res.json(medicines);
});

// CREATE medicine
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = medicineSchema.parse(req.body);

  const medicine = await prisma.medicine.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json(medicine);
});

// UPDATE medicine
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const data = medicineSchema.partial().parse(req.body);

  const medicine = await prisma.medicine.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data,
  });

  if (medicine.count === 0) {
    throw new AppError('Medicine not found', 404);
  }

  const updated = await prisma.medicine.findUnique({
    where: { id: req.params.id },
  });

  res.json(updated);
});

// GET low stock medicines
router.get('/low-stock/alert', async (req: AuthRequest, res: Response) => {
  const medicines = await prisma.medicine.findMany({
    where: {
      tenantId: req.tenantId,
      batches: {
        some: {
          quantity: { lte: 10 },
        },
      },
    },
    include: {
      batches: {
        where: { quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
      },
    },
  });

  res.json(medicines);
});

// GET expiring soon medicines
router.get('/expiry/soon', async (req: AuthRequest, res: Response) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const medicines = await prisma.medicine.findMany({
    where: {
      tenantId: req.tenantId,
      batches: {
        some: {
          expiryDate: {
            lte: thirtyDaysFromNow,
            gte: new Date(),
          },
          quantity: { gt: 0 },
        },
      },
    },
    include: {
      batches: {
        where: {
          expiryDate: {
            lte: thirtyDaysFromNow,
            gte: new Date(),
          },
          quantity: { gt: 0 },
        },
        orderBy: { expiryDate: 'asc' },
      },
    },
  });

  res.json(medicines);
});

// GET medicine by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const medicine = await prisma.medicine.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      batches: {
        orderBy: { expiryDate: 'asc' },
      },
    },
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404);
  }

  res.json(medicine);
});

export default router;
