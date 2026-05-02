import { Router, Response } from 'express';
import { InvoiceStatus, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const invoiceSchema = z.object({
  supplierId: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string().datetime(),
  subtotal: z.number().positive(),
  gstAmount: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  documentUrl: z.string().optional(),
  ocrData: z.record(z.any()).optional(),
  status: z.enum(['PENDING', 'PROCESSED', 'VERIFIED', 'CANCELLED']).default('PENDING'),
});

// GET all invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  const typedStatus =
    typeof status === 'string' && Object.values(InvoiceStatus).includes(status as InvoiceStatus)
      ? (status as InvoiceStatus)
      : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: req.tenantId,
      ...(typedStatus && { status: typedStatus }),
    },
    include: {
      supplier: true,
      batches: {
        include: { medicine: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(invoices);
});

// CREATE invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  const data = invoiceSchema.parse(req.body);

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      tenantId: req.tenantId!,
      invoiceDate: new Date(data.invoiceDate),
    },
    include: {
      supplier: true,
    },
  });

  res.status(201).json(invoice);
});

// UPDATE invoice status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = z.object({
    status: z.enum(['PENDING', 'PROCESSED', 'VERIFIED', 'CANCELLED']),
  }).parse(req.body);

  const invoice = await prisma.invoice.updateMany({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    data: { status },
  });

  if (invoice.count === 0) {
    throw new AppError('Invoice not found', 404);
  }

  const updated = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { supplier: true, batches: true },
  });

  res.json(updated);
});

// GET invoice summary (recent invoices with totals)
router.get('/summary/recent', async (req: AuthRequest, res: Response) => {
  const invoices = await prisma.invoice.findMany({
    where: { tenantId: req.tenantId },
    include: { supplier: true },
    orderBy: { invoiceDate: 'desc' },
    take: 10,
  });

  const summary = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    invoices,
  };

  res.json(summary);
});

// GET invoice by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId,
    },
    include: {
      supplier: true,
      batches: {
        include: { medicine: true },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.json(invoice);
});

export default router;
