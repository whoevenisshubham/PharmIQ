import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const frontendSchedules = ['OTC', 'H', 'H1', 'X'] as const;
type FrontendSchedule = (typeof frontendSchedules)[number];

type BranchInventoryRow = {
  id: string;
  medicineId: string;
  batchNo: string;
  expiryDate: string;
  manufacturingDate: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
  supplierId: string;
  invoiceId: string;
  status: 'Available' | 'Blocked' | 'Expired' | 'Exhausted';
};

const createMedicineSchema = z.object({
  brandName: z.string().min(1),
  genericName: z.string().min(1),
  category: z.string().min(1).default('General'),
  packSize: z.string().min(1).default('1 unit'),
  manufacturer: z.string().min(1).default('Unknown'),
  hsnCode: z.string().min(1).default('30049099'),
  gstRate: z.union([z.literal(5), z.literal(12), z.literal(18)]).default(12),
  scheduleType: z.enum(frontendSchedules).default('OTC'),
  reorderPoint: z.number().int().nonnegative().default(20),
  batchNo: z.string().min(1),
  expiryDate: z.string().min(1),
  manufacturingDate: z.string().optional(),
  quantity: z.number().int().positive(),
  purchaseRate: z.number().positive(),
  mrp: z.number().positive(),
  supplierId: z.string().min(1),
});

const importRowSchema = z.object({
  brandName: z.string().min(1),
  genericName: z.string().min(1),
  category: z.string().min(1).default('General'),
  packSize: z.string().min(1).default('1 unit'),
  manufacturer: z.string().min(1).default('Unknown'),
  hsnCode: z.string().min(1).default('30049099'),
  gstRate: z.union([z.literal(5), z.literal(12), z.literal(18)]).default(12),
  scheduleType: z.enum(frontendSchedules).default('OTC'),
  reorderPoint: z.number().int().nonnegative().default(20),
  batchNo: z.string().min(1),
  expiryDate: z.string().min(1),
  manufacturingDate: z.string().optional(),
  quantity: z.number().int().positive(),
  purchaseRate: z.number().positive(),
  mrp: z.number().positive(),
  supplierId: z.string().min(1).optional(),
});

const transferSchema = z.object({
  sourceBranchId: z.string().min(1),
  destinationBranchId: z.string().min(1),
  lines: z.array(z.object({ medicineId: z.string().min(1), quantity: z.number().int().positive() })).min(1),
});

const csvParse = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { headers: [], rows: [] as string[][] };
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(',').map((part) => part.trim()));
  return { headers, rows };
};

const toIsoDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

const toFrontendSchedule = (schedule: string): FrontendSchedule => {
  if (schedule === 'SCHEDULE_H') return 'H';
  if (schedule === 'SCHEDULE_H1') return 'H1';
  if (schedule === 'SCHEDULE_X' || schedule === 'SCHEDULE_Y') return 'X';
  return 'OTC';
};

const toBackendSchedule = (schedule: FrontendSchedule) => {
  if (schedule === 'H') return 'SCHEDULE_H';
  if (schedule === 'H1') return 'SCHEDULE_H1';
  if (schedule === 'X') return 'SCHEDULE_X';
  return 'GENERAL';
};

async function requireBranch(tenantId: string | undefined, branchId: string) {
  if (!tenantId) {
    throw new AppError('Tenant context missing', 400);
  }

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, tenantId },
  });

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  return branch;
}

function mapBranchRow(stock: {
  id: string;
  quantity: number;
  status: string;
  batch: {
    id: string;
    medicineId: string;
    batchNumber: string;
    expiryDate: Date;
    manufacturingDate: Date | null;
    costPrice: number;
    sellingPrice: number;
    supplierId: string;
    invoiceId: string | null;
    medicine: { id: string; name: string };
  };
}): BranchInventoryRow {
  const now = new Date();
  const expiry = new Date(stock.batch.expiryDate);
  const expired = expiry.getTime() < now.getTime();

  return {
    id: stock.id,
    medicineId: stock.batch.medicineId,
    batchNo: stock.batch.batchNumber,
    expiryDate: expiry.toISOString().split('T')[0],
    manufacturingDate: (stock.batch.manufacturingDate || now).toISOString().split('T')[0],
    quantity: stock.quantity,
    purchaseRate: stock.batch.costPrice,
    mrp: stock.batch.sellingPrice,
    supplierId: stock.batch.supplierId,
    invoiceId: stock.batch.invoiceId || '',
    status: expired ? 'Expired' : (stock.status as BranchInventoryRow['status']),
  };
}

async function buildBranchInventory(branchId: string, tenantId: string) {
  const [branch, medicines, suppliers, stocks] = await Promise.all([
    prisma.branch.findFirst({ where: { id: branchId, tenantId } }),
    prisma.medicine.findMany({
      where: {
        tenantId,
        batches: {
          some: {
            branchStocks: {
              some: { branchId, quantity: { gt: 0 } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: {
        tenantId,
        batches: {
          some: {
            branchStocks: {
              some: { branchId, quantity: { gt: 0 } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.branchStock.findMany({
      where: { tenantId, branchId },
      include: {
        batch: {
          include: { medicine: true },
        },
      },
      orderBy: [{ batch: { expiryDate: 'asc' } }, { createdAt: 'desc' }],
    }),
  ]);

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  const branchCustomers = await prisma.customer.findMany({
    where: {
      tenantId,
      transactions: {
        some: { branchId },
      },
    },
    orderBy: { name: 'asc' },
    take: 200,
  });

  const allCustomers = await prisma.customer.findMany({ where: { tenantId }, orderBy: { name: 'asc' }, take: 200 });
  const mergedCustomers = [...branchCustomers, ...allCustomers].filter(
    (customer, idx, arr) => arr.findIndex((item) => item.id === customer.id) === idx,
  );

  const branchInventory = stocks.map(mapBranchRow);

  return {
    branch,
    medicines: medicines.map((medicine) => ({
      id: medicine.id,
      brandName: medicine.name,
      genericName: medicine.generic,
      category: medicine.category,
      packSize: medicine.packSize,
      manufacturer: medicine.manufacturer,
      hsnCode: medicine.hsnCode || '',
      gstRate: medicine.gstRate as 5 | 12 | 18,
      scheduleType: toFrontendSchedule(medicine.scheduleType),
      reorderPoint: medicine.reorderLevel,
      createdAt: medicine.createdAt.toISOString().split('T')[0],
    })),
    batches: branchInventory,
    suppliers: suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      gstin: supplier.gstNumber || '',
      city: supplier.address?.split(',').pop()?.trim() || '',
      totalPurchases: 0,
      outstanding: 0,
      lastOrderDate: supplier.createdAt.toISOString().split('T')[0],
      status: 'Active' as const,
      drugLicenseNo: undefined,
    })),
    customers: mergedCustomers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      totalSpent: 0,
      totalVisits: 0,
      lastVisitDate: customer.createdAt.toISOString().split('T')[0],
      tags: [],
      loyaltyPoints: customer.loyaltyPoints,
      tenantId: customer.tenantId,
      createdAt: customer.createdAt.toISOString().split('T')[0],
    })),
  };
}

async function upsertMedicineBatch(branchId: string, tenantId: string, input: z.infer<typeof createMedicineSchema>) {
  return prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name: input.brandName,
        },
      },
      create: {
        tenantId,
        name: input.brandName,
        generic: input.genericName,
        category: input.category,
        packSize: input.packSize,
        manufacturer: input.manufacturer,
        hsnCode: input.hsnCode,
        gstRate: input.gstRate,
        scheduleType: toBackendSchedule(input.scheduleType),
        reorderLevel: input.reorderPoint,
        unit: 'unit',
      },
      update: {
        generic: input.genericName,
        category: input.category,
        packSize: input.packSize,
        manufacturer: input.manufacturer,
        hsnCode: input.hsnCode,
        gstRate: input.gstRate,
        scheduleType: toBackendSchedule(input.scheduleType),
        reorderLevel: input.reorderPoint,
      },
    });

    const expiryDate = new Date(input.expiryDate);
    const manufacturingDate = input.manufacturingDate ? new Date(input.manufacturingDate) : undefined;
    const batchNumber = input.batchNo;

    const existingBatch = await tx.batch.findFirst({
      where: {
        tenantId,
        medicineId: medicine.id,
        batchNumber,
      },
    });

    let batch;
    if (existingBatch) {
      batch = await tx.batch.update({
        where: { id: existingBatch.id },
        data: {
          expiryDate,
          manufacturingDate,
          quantity: { increment: input.quantity },
          costPrice: input.purchaseRate,
          sellingPrice: input.mrp,
          supplierId: input.supplierId,
          invoiceId: existingBatch.invoiceId,
        },
      });
    } else {
      batch = await tx.batch.create({
        data: {
          tenantId,
          medicineId: medicine.id,
          batchNumber,
          expiryDate,
          manufacturingDate,
          quantity: input.quantity,
          costPrice: input.purchaseRate,
          sellingPrice: input.mrp,
          supplierId: input.supplierId,
        },
      });
    }

    const branchStock = await tx.branchStock.upsert({
      where: {
        branchId_batchId: {
          branchId,
          batchId: batch.id,
        },
      },
      create: {
        tenantId,
        branchId,
        batchId: batch.id,
        quantity: input.quantity,
        status: 'Available',
      },
      update: {
        quantity: { increment: input.quantity },
        status: 'Available',
      },
      include: {
        batch: { include: { medicine: true } },
      },
    });

    return { medicine, batch, branchStock };
  });
}

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.tenantId) {
    throw new AppError('Tenant context missing', 400);
  }

  const branches = await prisma.branch.findMany({
    where: { tenantId: req.tenantId },
    orderBy: { createdAt: 'asc' },
  });

  res.json(branches);
});

router.get('/:branchId/inventory', async (req: AuthRequest, res: Response) => {
  const snapshot = await buildBranchInventory(req.params.branchId, req.tenantId!);
  res.json(snapshot);
});

router.post('/:branchId/inventory/medicine-batch', async (req: AuthRequest, res: Response) => {
  await requireBranch(req.tenantId, req.params.branchId);
  const input = createMedicineSchema.parse(req.body);
  const result = await upsertMedicineBatch(req.params.branchId, req.tenantId!, input);
  res.status(201).json({
    medicine: {
      id: result.medicine.id,
      brandName: result.medicine.name,
      genericName: result.medicine.generic,
      category: result.medicine.category,
      packSize: result.medicine.packSize,
      manufacturer: result.medicine.manufacturer,
      hsnCode: result.medicine.hsnCode || '',
      gstRate: result.medicine.gstRate,
      scheduleType: toFrontendSchedule(result.medicine.scheduleType),
      reorderPoint: result.medicine.reorderLevel,
      createdAt: result.medicine.createdAt.toISOString().split('T')[0],
    },
    batch: result.branchStock,
  });
});

router.post('/:branchId/inventory/import', async (req: AuthRequest, res: Response) => {
  await requireBranch(req.tenantId, req.params.branchId);
  const { csvText } = z.object({ csvText: z.string().min(1) }).parse(req.body);
  const tenantId = req.tenantId!;
  const { headers, rows } = csvParse(csvText);

  if (headers.length === 0) {
    throw new AppError('CSV must include a header and at least one row', 400);
  }

  const indexOf = (key: string) => headers.indexOf(key.toLowerCase());
  const created: Array<{ medicineId: string; batchId: string }> = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const getValue = (key: string) => {
      const idx = indexOf(key);
      return idx >= 0 ? (row[idx] || '').trim() : '';
    };

    try {
      const parsed = importRowSchema.parse({
        brandName: getValue('brandname'),
        genericName: getValue('genericname'),
        category: getValue('category') || 'General',
        packSize: getValue('packsize') || '1 unit',
        manufacturer: getValue('manufacturer') || 'Unknown',
        hsnCode: getValue('hsncode') || '30049099',
        gstRate: Number(getValue('gstrate') || '12') as 5 | 12 | 18,
        scheduleType: (getValue('scheduletype') || 'OTC') as FrontendSchedule,
        reorderPoint: Number(getValue('reorderpoint') || '20'),
        batchNo: getValue('batchno'),
        expiryDate: getValue('expirydate'),
        manufacturingDate: getValue('manufacturingdate') || undefined,
        quantity: Number(getValue('quantity') || '0'),
        purchaseRate: Number(getValue('purchaserate') || '0'),
        mrp: Number(getValue('mrp') || '0'),
        supplierId: getValue('supplierid') || undefined,
      });

      let supplierId = parsed.supplierId;
      if (!supplierId) {
        const supplier = await prisma.supplier.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
        if (!supplier) {
          throw new AppError('No supplier available for CSV import', 400);
        }
        supplierId = supplier.id;
      }

      const result = await upsertMedicineBatch(req.params.branchId, tenantId, {
        ...parsed,
        supplierId,
      });
      created.push({ medicineId: result.medicine.id, batchId: result.batch.id });
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'parse error'}`);
    }
  }

  const snapshot = await buildBranchInventory(req.params.branchId, req.tenantId!);
  res.json({
    medicinesCreated: created.length,
    batchesCreated: created.length,
    errors,
    inventory: snapshot,
  });
});

router.patch('/:branchId/inventory/batches/:batchId/block', async (req: AuthRequest, res: Response) => {
  await requireBranch(req.tenantId, req.params.branchId);
  const branchStock = await prisma.branchStock.findFirst({
    where: { tenantId: req.tenantId, branchId: req.params.branchId, id: req.params.batchId },
  });

  if (!branchStock) {
    throw new AppError('Batch not found', 404);
  }

  const nextStatus = branchStock.status === 'Blocked' ? (branchStock.quantity > 0 ? 'Available' : 'Exhausted') : 'Blocked';
  const updated = await prisma.branchStock.update({
    where: { id: branchStock.id },
    data: { status: nextStatus },
    include: { batch: { include: { medicine: true } } },
  });

  res.json({ batch: mapBranchRow(updated), message: nextStatus === 'Blocked' ? 'Batch blocked' : 'Batch unblocked' });
});

router.post('/transfer', async (req: AuthRequest, res: Response) => {
  if (!req.tenantId) {
    throw new AppError('Tenant context missing', 400);
  }
  const tenantId = req.tenantId;

  const { sourceBranchId, destinationBranchId, lines } = transferSchema.parse(req.body);
  if (sourceBranchId === destinationBranchId) {
    throw new AppError('Source and destination must be different', 400);
  }

  await Promise.all([
    requireBranch(req.tenantId, sourceBranchId),
    requireBranch(req.tenantId, destinationBranchId),
  ]);

  const result = await prisma.$transaction(async (tx) => {
    let moved = 0;

    for (const line of lines) {
      let remaining = line.quantity;

      const sourceStocks = await tx.branchStock.findMany({
        where: {
          tenantId: req.tenantId,
          branchId: sourceBranchId,
          batch: { medicineId: line.medicineId },
          quantity: { gt: 0 },
          status: { not: 'Blocked' },
        },
        include: { batch: true },
        orderBy: { batch: { expiryDate: 'asc' } },
      });

      const available = sourceStocks.reduce((sum, stock) => sum + stock.quantity, 0);
      if (available < line.quantity) {
        throw new AppError(`Insufficient stock for medicine ${line.medicineId}`, 400);
      }

      for (const sourceStock of sourceStocks) {
        if (remaining <= 0) break;

        const transferable = Math.min(remaining, sourceStock.quantity);
        remaining -= transferable;
        moved += transferable;

        await tx.branchStock.update({
          where: { id: sourceStock.id },
          data: {
            quantity: { decrement: transferable },
            status: sourceStock.quantity - transferable === 0 ? 'Exhausted' : sourceStock.status,
          },
        });

        await tx.branchStock.upsert({
          where: {
            branchId_batchId: {
              branchId: destinationBranchId,
              batchId: sourceStock.batchId,
            },
          },
          create: {
            tenantId,
            branchId: destinationBranchId,
            batchId: sourceStock.batchId,
            quantity: transferable,
            status: 'Available',
          },
          update: {
            quantity: { increment: transferable },
            status: 'Available',
          },
        });
      }
    }

    return { moved };
  });

  const [sourceInventory, destinationInventory] = await Promise.all([
    buildBranchInventory(sourceBranchId, req.tenantId),
    buildBranchInventory(destinationBranchId, req.tenantId),
  ]);

  res.json({
    success: true,
    moved: result.moved,
    sourceInventory,
    destinationInventory,
  });
});

export default router;
