import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const prescriptionSchema = z.object({
  customerId: z.string(),
  doctorName: z.string().min(1),
  clinicName: z.string().optional(),
  medicineRequested: z.array(z.string()).min(1),
  quantity: z.array(z.number().positive()).min(1),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  documentUrl: z.string().optional(),
});

// GET all prescriptions
router.get('/', async (req: AuthRequest, res: Response) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { tenantId: req.tenantId },
    include: {
      customer: true,
      pos_transactions: true,
    },
    orderBy: { issueDate: 'desc' },
  });

  res.json(prescriptions);
});

// CREATE prescription
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = prescriptionSchema.parse(req.body);

  if (data.medicineRequested.length !== data.quantity.length) {
    throw new AppError('Medicines and quantities must have the same length', 400);
  }

  const prescription = await prisma.prescription.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
      issueDate: new Date(data.issueDate),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
    include: { customer: true },
  });

  res.status(201).json(prescription);
});

// UPDATE prescription verification status
router.patch('/:id/verify', async (req: AuthRequest, res: Response) => {
  const { verificationStatus } = z.object({
    verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED']),
  }).parse(req.body);

  const prescription = await prisma.prescription.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data: { verificationStatus },
  });

  if (prescription.count === 0) {
    throw new AppError('Prescription not found', 404);
  }

  const updated = await prisma.prescription.findUnique({
    where: { id: req.params.id },
    include: { customer: true },
  });

  res.json(updated);
});

// GET pending verifications
router.get('/pending/list', async (req: AuthRequest, res: Response) => {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      tenantId: req.tenantId,
      verificationStatus: 'PENDING',
    },
    include: { customer: true },
    orderBy: { issueDate: 'desc' },
  });

  res.json(prescriptions);
});

// GET prescriptions for customer
router.get('/customer/:customerId', async (req: AuthRequest, res: Response) => {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      tenantId: req.tenantId,
      customerId: req.params.customerId,
      expiryDate: {
        gte: new Date(),
      },
    },
    orderBy: { issueDate: 'desc' },
  });

  res.json(prescriptions);
});

// GET prescription by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const prescription = await prisma.prescription.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      customer: true,
      pos_transactions: {
        include: {
          items: {
            include: {
              batch: { include: { medicine: true } },
            },
          },
        },
      },
    },
  });

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  res.json(prescription);
});

export default router;
