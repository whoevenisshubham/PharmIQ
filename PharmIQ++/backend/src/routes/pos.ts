import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const posItemSchema = z.object({
  batchId: z.string(),
  quantity: z.number().int().positive(),
});

const posTransactionSchema = z.object({
  branchId: z.string(),
  items: z.array(posItemSchema).min(1),
  customerId: z.string().optional(),
  prescriptionId: z.string().optional(),
  discountAmount: z.number().nonnegative().default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CHEQUE', 'SPLIT']).default('CASH'),
  notes: z.string().optional(),
});

// CREATE POS transaction
router.post('/transaction', async (req: AuthRequest, res: Response) => {
  const data = posTransactionSchema.parse(req.body);

  await prisma.branch.findFirstOrThrow({
    where: { id: data.branchId, tenantId: req.tenantId },
  });

  // Start a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Validate and fetch all branch stock rows with their batches and medicines
    const stocks = await tx.branchStock.findMany({
      where: {
        id: { in: data.items.map(item => item.batchId) },
        tenantId: req.tenantId,
        branchId: data.branchId,
      },
      include: { batch: { include: { medicine: true } } },
    });

    if (stocks.length !== data.items.length) {
      throw new AppError('One or more batches not found', 404);
    }

    // Check stock availability and calculate totals
    let subtotal = 0;
    let totalGst = 0;
    const posItems = [];

    for (const item of data.items) {
      const stock = stocks.find(b => b.id === item.batchId);
      if (!stock) {
        throw new AppError(`Batch ${item.batchId} not found`, 404);
      }

      if (stock.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${stock.batch.medicine.name}. Available: ${stock.quantity}`, 400);
      }

      const lineTotal = stock.batch.sellingPrice * item.quantity;
      const gstAmount = (lineTotal * stock.batch.medicine.gstRate) / 100;

      subtotal += lineTotal;
      totalGst += gstAmount;

      posItems.push({
        batchId: stock.batchId,
        quantity: item.quantity,
        unitPrice: stock.batch.sellingPrice,
        lineTotal,
      });

      // Update branch stock and total batch quantity
      await tx.branchStock.update({
        where: { id: stock.id },
        data: {
          quantity: { decrement: item.quantity },
          status: stock.quantity - item.quantity === 0 ? 'Exhausted' : stock.status,
        },
      });

      await tx.batch.update({
        where: { id: stock.batchId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    const finalTotal = subtotal + totalGst - (data.discountAmount || 0);

    // Create transaction
    const transaction = await tx.pOSTransaction.create({
      data: {
        tenantId: req.tenantId!,
        branchId: data.branchId,
        userId: req.userId!,
        customerId: data.customerId,
        prescriptionId: data.prescriptionId,
        items: {
          create: posItems,
        },
        subtotal,
        discountAmount: data.discountAmount || 0,
        gstAmount: totalGst,
        totalAmount: finalTotal,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'COMPLETED',
        notes: data.notes,
      },
      include: {
        items: {
          include: {
            batch: {
              include: { medicine: true },
            },
          },
        },
        customer: true,
        user: true,
      },
    });

    // Log audit
    await tx.auditLog.create({
      data: {
        tenantId: req.tenantId!,
        userId: req.userId!,
        action: 'POS_SALE',
        entityType: 'POSTransaction',
        entityId: transaction.id,
        changes: {
          totalAmount: finalTotal,
          itemCount: data.items.length,
        },
      },
    });

    return transaction;
  });

  res.status(201).json(result);
});

// GET transaction by ID
router.get('/transaction/:id', async (req: AuthRequest, res: Response) => {
  const transaction = await prisma.pOSTransaction.findFirst({
    where: {
      id: req.params.id,
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
      customer: true,
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      prescription: true,
    },
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.json(transaction);
});

// GET all transactions
router.get('/', async (req: AuthRequest, res: Response) => {
  const { from, to, branchId } = req.query;

  const whereClause: any = { tenantId: req.tenantId };

  if (typeof branchId === 'string') {
    whereClause.branchId = branchId;
  }

  if (from && to) {
    whereClause.transactionDate = {
      gte: new Date(from as string),
      lte: new Date(to as string),
    };
  }

  const transactions = await prisma.pOSTransaction.findMany({
    where: whereClause,
    include: {
      branch: true,
      customer: true,
      user: {
        select: { firstName: true, lastName: true },
      },
      items: { include: { batch: { include: { medicine: true } } } },
    },
    orderBy: { transactionDate: 'desc' },
  });

  res.json(transactions);
});

// GET dashboard summary
router.get('/summary/dashboard', async (req: AuthRequest, res: Response) => {
  const { branchId } = req.query;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const branchWhere = typeof branchId === 'string' ? { branchId } : {};

  const [todaySales, totalCustomers, lowStockCount, expiringBatches] = await Promise.all([
    prisma.pOSTransaction.aggregate({
      where: {
        tenantId: req.tenantId,
        ...branchWhere,
        transactionDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.customer.count({ where: { tenantId: req.tenantId } }),
    prisma.batch.count({
      where: {
        tenantId: req.tenantId,
        ...(typeof branchId === 'string' ? { branchStocks: { some: { branchId } } } : {}),
        quantity: { lte: 10 },
      },
    }),
    prisma.batch.count({
      where: {
        tenantId: req.tenantId,
        ...(typeof branchId === 'string' ? { branchStocks: { some: { branchId } } } : {}),
        expiryDate: {
          lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          gte: today,
        },
        quantity: { gt: 0 },
      },
    }),
  ]);

  res.json({
    todaySales: todaySales._sum.totalAmount || 0,
    todayTransactions: todaySales._count,
    totalCustomers,
    lowStockItems: lowStockCount,
    expiringItems: expiringBatches,
  });
});

export default router;
