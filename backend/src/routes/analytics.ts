import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const toStartOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const formatLabel = (date: Date) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const deriveCategory = (medicineName: string, genericName: string) => {
  const value = `${medicineName} ${genericName}`.toLowerCase();

  if (/(metformin|glimepiride|insulin|sitagliptin|linagliptin|dapagliflozin|empagliflozin|glipizide|pioglitazone)/.test(value)) return 'Antidiabetic';
  if (/(amlodipine|telmisartan|atorvastatin|losartan|clopidogrel|aspirin|rosuvastatin|carvedilol|metoprolol)/.test(value)) return 'Cardiac';
  if (/(amoxicillin|azithromycin|cef|cefixime|ciprofloxacin|doxycycline|metronidazole|amikacin|meropenem)/.test(value)) return 'Antibiotics';
  if (/(paracetamol|ibuprofen|diclofenac|tramadol|naproxen|ketorolac|aceclofenac)/.test(value)) return 'Analgesics';
  if (/(pantoprazole|rabeprazole|omeprazole|lansoprazole|sucralfate|domperidone|esomeprazole)/.test(value)) return 'GI';
  if (/(vitamin|cholecalciferol|biotin|folic acid|methylcobalamin|pyridoxine|thiamine|multivitamin)/.test(value)) return 'Vitamins';
  if (/(cetirizine|levocetirizine|montelukast|fexofenadine|loratadine)/.test(value)) return 'Antiallergic';
  if (/(salbutamol|levosalbutamol|budesonide|formoterol|montelukast|ambroxol|dextromethorphan)/.test(value)) return 'Cough & Cold';
  return 'General';
};

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  if (!req.tenantId) {
    throw new AppError('Tenant context missing', 400);
  }

  const branchId = typeof req.query.branchId === 'string' ? req.query.branchId : undefined;

  const today = toStartOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

  const [transactions, medicines, batches, customers, suppliers, invoices] = await Promise.all([
    prisma.pOSTransaction.findMany({
      where: { tenantId: req.tenantId, ...(branchId ? { branchId } : {}) },
      include: {
        customer: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { batch: { include: { medicine: true } } } },
      },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.medicine.findMany({
      where: { tenantId: req.tenantId, ...(branchId ? { batches: { some: { branchStocks: { some: { branchId } } } } } : {}) },
      include: {
        batches: {
          where: {
            quantity: { gt: 0 },
            ...(branchId ? { branchStocks: { some: { branchId } } } : {}),
          },
          include: {
            branchStocks: branchId ? { where: { branchId } } : false,
          },
        },
      },
    }),
    prisma.batch.findMany({
      where: { tenantId: req.tenantId, ...(branchId ? { branchStocks: { some: { branchId } } } : {}) },
      include: {
        medicine: true,
        supplier: true,
        branchStocks: branchId ? { where: { branchId } } : false,
      },
    }),
    prisma.customer.findMany({
      where: {
        tenantId: req.tenantId,
        ...(branchId ? { transactions: { some: { branchId } } } : {}),
      },
    }),
    prisma.supplier.findMany({
      where: {
        tenantId: req.tenantId,
        ...(branchId ? { batches: { some: { branchStocks: { some: { branchId } } } } } : {}),
      },
    }),
    prisma.invoice.findMany({
      where: {
        tenantId: req.tenantId,
        ...(branchId ? { batches: { some: { branchStocks: { some: { branchId } } } } } : {}),
      },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const effectiveBatchQty = (batch: { quantity: number; branchStocks?: Array<{ quantity: number }> }) => {
    if (!branchId) return batch.quantity;
    return (batch.branchStocks || []).reduce((sum, stock) => sum + stock.quantity, 0);
  };

  const todaySales = transactions
    .filter((tx) => tx.transactionDate >= today)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const yesterdaySales = transactions
    .filter((tx) => tx.transactionDate >= yesterday && tx.transactionDate < today)
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
  const todayOrders = transactions.filter((tx) => tx.transactionDate >= today).length;

  const lowStockMedicines = medicines.filter((medicine) => {
    const stock = medicine.batches.reduce((sum, batch) => sum + effectiveBatchQty(batch), 0);
    return stock > 0 && stock <= medicine.reorderLevel;
  });

  const expiringBatches = batches.filter((batch) => {
    if (effectiveBatchQty(batch) <= 0) return false;
    const diffDays = Math.ceil((new Date(batch.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dayStart = toStartOfDay(d);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayTransactions = transactions.filter((tx) => tx.transactionDate >= dayStart && tx.transactionDate < dayEnd);

    return {
      date: formatLabel(dayStart),
      revenue: dayTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0),
      orders: dayTransactions.length,
    };
  });

  const topMedicineMap = new Map<string, { name: string; revenue: number; units: number }>();
  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      const key = item.batch.medicine.id;
      const existing = topMedicineMap.get(key) || { name: item.batch.medicine.name, revenue: 0, units: 0 };
      existing.revenue += item.lineTotal;
      existing.units += item.quantity;
      topMedicineMap.set(key, existing);
    });
  });

  const topMedicines = Array.from(topMedicineMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const categoryRevenueMap = new Map<string, number>();
  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      const category = deriveCategory(item.batch.medicine.name, item.batch.medicine.generic);
      categoryRevenueMap.set(category, (categoryRevenueMap.get(category) || 0) + item.lineTotal);
    });
  });

  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#64748b'];
  const categoryBreakdown = Array.from(categoryRevenueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value, color: palette[index % palette.length] }));

  const stockAgingCategories = ['Cardiac', 'Antidiabetic', 'Antibiotics', 'Vitamins', 'Analgesics', 'GI', 'Antiallergic', 'Cough & Cold', 'General'];
  const stockAging = stockAgingCategories.map((category) => {
    const categoryBatches = batches.filter((batch) => deriveCategory(batch.medicine.name, batch.medicine.generic) === category && effectiveBatchQty(batch) > 0);
    let healthy = 0;
    let expiring3m = 0;
    let expiring6m = 0;
    let dead = 0;

    categoryBatches.forEach((batch) => {
      const quantity = effectiveBatchQty(batch);
      const days = Math.ceil((new Date(batch.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (days < 0) dead += quantity;
      else if (days <= 90) expiring3m += quantity;
      else if (days <= 180) expiring6m += quantity;
      else healthy += quantity;
    });

    return { category, healthy, expiring3m, expiring6m, dead };
  }).filter((row) => row.healthy || row.expiring3m || row.expiring6m || row.dead);

  const recentTransactions = transactions.slice(0, 8).map((tx) => ({
    id: tx.id,
    invoiceNo: tx.id.slice(0, 10).toUpperCase(),
    customerName: tx.customer?.name || 'Walk-in Customer',
    amount: tx.totalAmount,
    paymentMethod: tx.paymentMethod,
    createdAt: tx.createdAt,
    createdBy: `${tx.user.firstName} ${tx.user.lastName}`.trim() || tx.user.email,
  }));

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  res.json({
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      todayRevenue: todaySales,
      todayRevenueDelta: yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0,
      todayOrders,
      lowStockCount: lowStockMedicines.length,
      expiringCount: expiringBatches.length,
      pendingPayables: invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      rxQueue: transactions.filter((tx) => tx.prescriptionId && tx.items.length > 0).length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalMedicines: medicines.length,
      totalBatches: batches.length,
    },
    trendData,
    topMedicines,
    categoryBreakdown,
    stockAging,
    recentTransactions,
    expiryAlerts: expiringBatches.slice(0, 7).map((batch) => {
      const days = Math.ceil((new Date(batch.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        batchId: batch.id,
        batchNo: batch.batchNumber,
        medicineName: batch.medicine.name,
        quantity: effectiveBatchQty(batch),
        daysLeft: days,
      };
    }),
  });
});

export default router;