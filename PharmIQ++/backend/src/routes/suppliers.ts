import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const supplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

// GET all suppliers
router.get('/', async (req: AuthRequest, res: Response) => {
  const suppliers = await prisma.supplier.findMany({
    where: { tenantId: req.tenantId },
    include: {
      batches: { select: { id: true } },
      invoices: { select: { id: true } },
    },
  });

  res.json(suppliers);
});

// GET supplier by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      batches: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404);
  }

  res.json(supplier);
});

// CREATE supplier
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = supplierSchema.parse(req.body);

  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json(supplier);
});

// UPDATE supplier
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const data = supplierSchema.partial().parse(req.body);

  const supplier = await prisma.supplier.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data,
  });

  if (supplier.count === 0) {
    throw new AppError('Supplier not found', 404);
  }

  const updated = await prisma.supplier.findUnique({
    where: { id: req.params.id },
  });

  res.json(updated);
});

// DELETE supplier
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  // Check if supplier has related batches or invoices
  const batches = await prisma.batch.count({
    where: {
      supplierId: req.params.id,
      tenantId: req.tenantId,
    },
  });

  if (batches > 0) {
    throw new AppError('Cannot delete supplier with existing batches', 400);
  }

  const supplier = await prisma.supplier.deleteMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
  });

  if (supplier.count === 0) {
    throw new AppError('Supplier not found', 404);
  }

  res.json({ message: 'Supplier deleted successfully' });
});

export default router;
