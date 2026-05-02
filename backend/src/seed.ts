import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoTenant = {
  name: 'PharmEZ Demo',
  email: 'admin@pharmez.in',
  phone: '9876543210',
  address: '12, FC Road, Deccan, Pune 411004',
  gstNumber: '27AADCB2230M1ZT',
};

const demoBranches = [
  { name: 'PharmEZ Bibwewadi', city: 'Pune', gstin: '27AADCB2230M1ZT', drugLicenseNo: 'MH-PUN-2021-0042', isActive: true, address: 'Shop 4, Bibwewadi Kondhwa Rd, Pune 411037', phone: '9876543210', email: 'pune.bibwewadi@pharmez.in' },
  { name: 'PharmEZ Katraj', city: 'Pune', gstin: '27AADCB2230M1ZT', drugLicenseNo: 'MH-PUN-2021-0043', isActive: true, address: 'Near Katraj Chowk, Pune Satara Rd, Pune 411046', phone: '9876543211', email: 'pune.katraj@pharmez.in' },
];

const demoSuppliers = [
  { name: 'Medline Distributors', email: 'orders@medline.in', phone: '9823456781', address: 'Plot 12, MIDC, Bhosari', gstNumber: '27AABCM1234A1ZK' },
  { name: 'HealthFirst Pharma', email: 'sales@healthfirst.in', phone: '9823456782', address: '23, Bund Garden Road', gstNumber: '27AABHF5678B1ZM' },
  { name: 'Apollo Wholesale', email: 'wholesale@apollo.in', phone: '9823456783', address: '5, APMC Road', gstNumber: '27AACPA9123C1ZN' },
  { name: 'Cipla Direct', email: 'direct@cipla.com', phone: '9823456784', address: '48, Vile Parle East', gstNumber: '27AADCD4567D1ZP' },
];

const demoCustomers = [
  { name: 'Rajesh Sharma', phone: '9876543220', email: 'rajesh.sharma@email.com', address: 'Pune', loyaltyPoints: 1245 },
  { name: 'Sunita Patel', phone: '9876543221', email: 'sunita.patel@email.com', address: 'Pune', loyaltyPoints: 832 },
  { name: 'Amit Kulkarni', phone: '9876543222', email: 'amit.kulkarni@email.com', address: 'Pune', loyaltyPoints: 345 },
  { name: 'Priya Desai', phone: '9876543223', email: 'priya.desai@email.com', address: 'Mumbai', loyaltyPoints: 2210 },
  { name: 'Mohit Joshi', phone: '9876543224', email: 'mohit.joshi@email.com', address: 'Pune', loyaltyPoints: 120 },
  { name: 'Kavitha Nair', phone: '9876543225', email: 'kavitha.nair@email.com', address: 'Nashik', loyaltyPoints: 1580 },
  { name: 'Suresh Mehta', phone: '9876543226', email: 'suresh.mehta@email.com', address: 'Pune', loyaltyPoints: 4560 },
  { name: 'Anita Singh', phone: '9876543227', email: 'anita.singh@email.com', address: 'Pune', loyaltyPoints: 670 },
  { name: 'Rohan Kulkarni', phone: '9876543228', email: 'rohan.k@email.com', address: 'Mumbai', loyaltyPoints: 510 },
  { name: 'Nidhi Patil', phone: '9876543229', email: 'nidhi.p@email.com', address: 'Pune', loyaltyPoints: 720 },
  { name: 'Farhan Shaikh', phone: '9876543230', email: 'farhan.s@email.com', address: 'Nashik', loyaltyPoints: 410 },
  { name: 'Deepa Iyer', phone: '9876543231', email: 'deepa.iyer@email.com', address: 'Mumbai', loyaltyPoints: 970 },
];

const demoMedicines = [
  { name: 'Metformin 500', generic: 'Metformin HCl', category: 'Antidiabetic', packSize: '10x10 tabs', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 50 },
  { name: 'Glimepiride 2mg', generic: 'Glimepiride', category: 'Antidiabetic', packSize: '10x10 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 30 },
  { name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', category: 'Antihypertensive', packSize: '10x10 tabs', manufacturer: 'Lupin Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 40 },
  { name: 'Telmisartan 40mg', generic: 'Telmisartan', category: 'Cardiac', packSize: '10x14 tabs', manufacturer: 'Dr Reddys', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 30 },
  { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Antibiotics', packSize: '10x10 caps', manufacturer: 'Alkem Labs', hsnCode: '30041099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 25 },
  { name: 'Azithromycin 500', generic: 'Azithromycin', category: 'Antibiotics', packSize: '3 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30041099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 20 },
  { name: 'Atorvastatin 10mg', generic: 'Atorvastatin Calcium', category: 'Cardiac', packSize: '10x10 tabs', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 35 },
  { name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', category: 'Antiallergic', packSize: '10x10 tabs', manufacturer: 'Torrent Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderLevel: 40 },
  { name: 'Paracetamol 500', generic: 'Paracetamol', category: 'Analgesics', packSize: '10x10 tabs', manufacturer: 'Mankind Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderLevel: 100 },
  { name: 'Pantoprazole 40mg', generic: 'Pantoprazole Sodium', category: 'Gastrointestinal', packSize: '10x15 tabs', manufacturer: 'Zydus Cadila', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 30 },
  { name: 'Losartan 50mg', generic: 'Losartan Potassium', category: 'Antihypertensive', packSize: '10x10 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 30 },
  { name: 'Clopidogrel 75mg', generic: 'Clopidogrel', category: 'Cardiac', packSize: '10x10 tabs', manufacturer: 'Intas Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 25 },
  { name: 'Vitamin D3 60K', generic: 'Cholecalciferol', category: 'Vitamins', packSize: '4 caps', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderLevel: 60 },
  { name: 'Montelukast 10mg', generic: 'Montelukast Sodium', category: 'Antiallergic', packSize: '10x10 tabs', manufacturer: 'Glenmark', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 25 },
  { name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Gastrointestinal', packSize: '10x10 caps', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 35 },
  { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', category: 'Analgesics', packSize: '10x10 tabs', manufacturer: 'Torrent Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderLevel: 80 },
  { name: 'Aspirin 75mg', generic: 'Acetylsalicylic Acid', category: 'Cardiac', packSize: '10x10 tabs', manufacturer: 'Bayer', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderLevel: 60 },
  { name: 'Rantidine 150mg', generic: 'Ranitidine', category: 'Gastrointestinal', packSize: '10x10 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 25 },
  { name: 'Lisinopril 10mg', generic: 'Lisinopril', category: 'Antihypertensive', packSize: '10x10 tabs', manufacturer: 'Micro Labs', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 30 },
  { name: 'Salbutamol 4mg', generic: 'Salbutamol Sulfate', category: 'Cough & Cold', packSize: '10x10 tabs', manufacturer: 'GSK India', hsnCode: '30049099', gstRate: 12, scheduleType: 'SCHEDULE_H', reorderLevel: 20 },
];

const demoBatches = [
  // High-volume bestsellers (frequent purchases)
  { medicineIndex: 0, batchNumber: 'MET2024A01', expiryDays: 420, manufacturingDays: -120, quantity: 500, costPrice: 28, sellingPrice: 45, supplierIndex: 0 },
  { medicineIndex: 0, batchNumber: 'MET2024A02', expiryDays: 350, manufacturingDays: -80, quantity: 400, costPrice: 28, sellingPrice: 45, supplierIndex: 0 },
  { medicineIndex: 8, batchNumber: 'PAR2024J01', expiryDays: 45, manufacturingDays: -300, quantity: 600, costPrice: 2, sellingPrice: 4, supplierIndex: 0 },
  { medicineIndex: 8, batchNumber: 'PAR2026EXP01', expiryDays: 18, manufacturingDays: -250, quantity: 300, costPrice: 2.5, sellingPrice: 5, supplierIndex: 0 },
  { medicineIndex: 2, batchNumber: 'AML2024C01', expiryDays: 390, manufacturingDays: -160, quantity: 350, costPrice: 52, sellingPrice: 90, supplierIndex: 2 },
  { medicineIndex: 2, batchNumber: 'AML2024C02', expiryDays: 300, manufacturingDays: -120, quantity: 280, costPrice: 52, sellingPrice: 90, supplierIndex: 2 },
  { medicineIndex: 1, batchNumber: 'GLI2024B01', expiryDays: 360, manufacturingDays: -140, quantity: 250, costPrice: 38, sellingPrice: 65, supplierIndex: 1 },
  { medicineIndex: 1, batchNumber: 'GLI2024B02', expiryDays: 400, manufacturingDays: -60, quantity: 200, costPrice: 38, sellingPrice: 65, supplierIndex: 1 },
  { medicineIndex: 3, batchNumber: 'TEL2024D01', expiryDays: 500, manufacturingDays: -100, quantity: 300, costPrice: 44, sellingPrice: 75, supplierIndex: 3 },
  { medicineIndex: 7, batchNumber: 'CET2024H01', expiryDays: 410, manufacturingDays: -70, quantity: 600, costPrice: 8, sellingPrice: 15, supplierIndex: 3 },
  // Medium-volume items
  { medicineIndex: 4, batchNumber: 'AMX2024E01', expiryDays: 340, manufacturingDays: -110, quantity: 250, costPrice: 72, sellingPrice: 125, supplierIndex: 0 },
  { medicineIndex: 5, batchNumber: 'AZI2024F01', expiryDays: 300, manufacturingDays: -90, quantity: 200, costPrice: 28, sellingPrice: 55, supplierIndex: 1 },
  { medicineIndex: 6, batchNumber: 'ATO2024G01', expiryDays: 460, manufacturingDays: -80, quantity: 280, costPrice: 18, sellingPrice: 32, supplierIndex: 2 },
  { medicineIndex: 9, batchNumber: 'PAN2024I01', expiryDays: 180, manufacturingDays: -130, quantity: 220, costPrice: 35, sellingPrice: 62, supplierIndex: 1 },
  { medicineIndex: 10, batchNumber: 'LOS2024K01', expiryDays: 350, manufacturingDays: -150, quantity: 180, costPrice: 22, sellingPrice: 40, supplierIndex: 2 },
  { medicineIndex: 11, batchNumber: 'CLO2024L01', expiryDays: 420, manufacturingDays: -140, quantity: 160, costPrice: 48, sellingPrice: 85, supplierIndex: 3 },
  // Additional stock for new medicines
  { medicineIndex: 12, batchNumber: 'VIT2024M01', expiryDays: 700, manufacturingDays: -150, quantity: 280, costPrice: 42, sellingPrice: 80, supplierIndex: 2 },
  { medicineIndex: 13, batchNumber: 'MON2024N01', expiryDays: 390, manufacturingDays: -170, quantity: 200, costPrice: 55, sellingPrice: 98, supplierIndex: 1 },
  { medicineIndex: 14, batchNumber: 'OMP2024O01', expiryDays: 360, manufacturingDays: -120, quantity: 240, costPrice: 32, sellingPrice: 58, supplierIndex: 0 },
  { medicineIndex: 15, batchNumber: 'IBU2024P01', expiryDays: 320, manufacturingDays: -110, quantity: 500, costPrice: 5, sellingPrice: 12, supplierIndex: 3 },
  { medicineIndex: 16, batchNumber: 'ASP2024Q01', expiryDays: 550, manufacturingDays: -100, quantity: 400, costPrice: 3, sellingPrice: 8, supplierIndex: 1 },
  { medicineIndex: 17, batchNumber: 'RAN2024R01', expiryDays: 340, manufacturingDays: -130, quantity: 220, costPrice: 18, sellingPrice: 35, supplierIndex: 2 },
  { medicineIndex: 18, batchNumber: 'LIS2024S01', expiryDays: 380, manufacturingDays: -110, quantity: 260, costPrice: 28, sellingPrice: 52, supplierIndex: 0 },
  { medicineIndex: 19, batchNumber: 'SAL2024T01', expiryDays: 290, manufacturingDays: -140, quantity: 240, costPrice: 12, sellingPrice: 22, supplierIndex: 3 },
];

const seedInvoices = [
  { supplierIndex: 0, invoiceNumber: 'INV-MDL-2026-001', daysAgo: 24, subtotal: 42000, gstAmount: 5040, totalAmount: 47040, status: 'PROCESSED' as const },
  { supplierIndex: 1, invoiceNumber: 'INV-HF-2026-007', daysAgo: 18, subtotal: 36500, gstAmount: 4380, totalAmount: 40880, status: 'PENDING' as const },
  { supplierIndex: 2, invoiceNumber: 'INV-APW-2026-014', daysAgo: 13, subtotal: 28500, gstAmount: 3420, totalAmount: 31920, status: 'VERIFIED' as const },
  { supplierIndex: 3, invoiceNumber: 'INV-CIP-2026-021', daysAgo: 9, subtotal: 51200, gstAmount: 6144, totalAmount: 57344, status: 'PENDING' as const },
  { supplierIndex: 0, invoiceNumber: 'INV-MDL-2026-028', daysAgo: 4, subtotal: 39800, gstAmount: 4776, totalAmount: 44576, status: 'PROCESSED' as const },
];

const now = new Date();
const addDays = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date;
};

const scheduleMap = {
  OTC: 'GENERAL',
  H: 'SCHEDULE_H',
  H1: 'SCHEDULE_H1',
  X: 'SCHEDULE_X',
} as const;

export async function seedDemoData() {
  const demoTenantRecord = await prisma.tenant.upsert({
    where: { email: demoTenant.email },
    update: {
      name: demoTenant.name,
      phone: demoTenant.phone,
      address: demoTenant.address,
      gstNumber: demoTenant.gstNumber,
    },
    create: demoTenant,
  });

  const demoPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenantRecord.id,
        email: demoTenant.email,
      },
    },
    update: {
      passwordHash: demoPassword,
      firstName: 'Admin',
      lastName: 'Owner',
      role: 'ADMIN',
    },
    create: {
      tenantId: demoTenantRecord.id,
      email: demoTenant.email,
      passwordHash: demoPassword,
      firstName: 'Admin',
      lastName: 'Owner',
      role: 'ADMIN',
    },
  });

  const branches = [];
  for (const branch of demoBranches) {
    const created = await prisma.branch.upsert({
      where: {
        tenantId_email: {
          tenantId: demoTenantRecord.id,
          email: branch.email,
        },
      },
      update: branch,
      create: {
        tenantId: demoTenantRecord.id,
        ...branch,
      },
    });
    branches.push(created);
  }

  // Keep only configured branches for the demo tenant.
  await prisma.branch.deleteMany({
    where: {
      tenantId: demoTenantRecord.id,
      id: { notIn: branches.map((branch) => branch.id) },
    },
  });

  const suppliers = [];
  for (const supplier of demoSuppliers) {
    const created = await prisma.supplier.upsert({
      where: {
        tenantId_name: {
          tenantId: demoTenantRecord.id,
          name: supplier.name,
        },
      },
      update: supplier,
      create: {
        tenantId: demoTenantRecord.id,
        ...supplier,
      },
    });
    suppliers.push(created);
  }

  const customers = [];
  for (const customer of demoCustomers) {
    const created = await prisma.customer.upsert({
      where: {
        tenantId_phone: {
          tenantId: demoTenantRecord.id,
          phone: customer.phone,
        },
      },
      update: customer,
      create: {
        tenantId: demoTenantRecord.id,
        ...customer,
        customerType: 'RETAIL',
      },
    });
    customers.push(created);
  }

  const medicines = [];
  for (const medicine of demoMedicines) {
    const created = await prisma.medicine.upsert({
      where: {
        tenantId_name: {
          tenantId: demoTenantRecord.id,
          name: medicine.name,
        },
      },
      update: {
        generic: medicine.generic,
        category: medicine.category,
        packSize: medicine.packSize,
        manufacturer: medicine.manufacturer,
        hsnCode: medicine.hsnCode,
        gstRate: medicine.gstRate,
        scheduleType: scheduleMap[medicine.scheduleType as keyof typeof scheduleMap],
        reorderLevel: medicine.reorderLevel,
      },
      create: {
        tenantId: demoTenantRecord.id,
        name: medicine.name,
        generic: medicine.generic,
        category: medicine.category,
        packSize: medicine.packSize,
        manufacturer: medicine.manufacturer,
        hsnCode: medicine.hsnCode,
        gstRate: medicine.gstRate,
        scheduleType: scheduleMap[medicine.scheduleType as keyof typeof scheduleMap],
        reorderLevel: medicine.reorderLevel,
        unit: 'tablet',
      },
    });
    medicines.push(created);
  }

  const batchRecords: Array<{ batch: { id: string; quantity: number; sellingPrice: number; expiryDate: Date }; supplierId: string; gstRate: number }> = [];
  for (const batchSeed of demoBatches) {
    const medicine = medicines[batchSeed.medicineIndex];
    const supplier = suppliers[batchSeed.supplierIndex];
    const existingBatch = await prisma.batch.findFirst({
      where: {
        tenantId: demoTenantRecord.id,
        medicineId: medicine.id,
        batchNumber: batchSeed.batchNumber,
      },
    });

    const batch = existingBatch
      ? await prisma.batch.update({
          where: { id: existingBatch.id },
          data: {
            expiryDate: addDays(batchSeed.expiryDays),
            manufacturingDate: addDays(batchSeed.manufacturingDays),
            quantity: batchSeed.quantity,
            costPrice: batchSeed.costPrice,
            sellingPrice: batchSeed.sellingPrice,
            supplierId: supplier.id,
          },
        })
      : await prisma.batch.create({
          data: {
            tenantId: demoTenantRecord.id,
            medicineId: medicine.id,
            batchNumber: batchSeed.batchNumber,
            expiryDate: addDays(batchSeed.expiryDays),
            manufacturingDate: addDays(batchSeed.manufacturingDays),
            quantity: batchSeed.quantity,
            costPrice: batchSeed.costPrice,
            sellingPrice: batchSeed.sellingPrice,
            supplierId: supplier.id,
          },
        });

    batchRecords.push({ batch, supplierId: supplier.id, gstRate: medicine.gstRate });
  }

  const activeBranches = branches.filter((branch) => branch.isActive);
  const seededBranches = activeBranches.length > 0 ? activeBranches : branches;

  await prisma.pOSTransaction.deleteMany({
    where: {
      tenantId: demoTenantRecord.id,
      OR: [
        { notes: { startsWith: 'SEED_TXN_' } },
        { notes: { startsWith: 'SEED_RX_TXN_' } },
      ],
    },
  });

  for (const entry of batchRecords) {
    const batch = entry.batch;
    const branchCount = Math.max(1, seededBranches.length);
    const weights = branchCount === 2
      ? [0.72, 0.28]
      : [0.38, 0.24, 0.18, 0.12, 0.08].slice(0, branchCount);
    while (weights.length < branchCount) {
      weights.push(1 / branchCount);
    }
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
    const normalized = weights.map((value) => value / weightSum);

    const allocations = normalized.map((weight) => Math.floor(batch.quantity * weight));
    const allocated = allocations.reduce((sum, value) => sum + value, 0);
    let remainder = batch.quantity - allocated;
    let idx = 0;
    while (remainder > 0 && allocations.length > 0) {
      allocations[idx % allocations.length] += 1;
      remainder -= 1;
      idx += 1;
    }

    for (let i = 0; i < seededBranches.length; i += 1) {
      const branch = seededBranches[i];
      const quantity = allocations[i] || 0;
      const expiryInDays = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const status = quantity === 0 ? 'Exhausted' : expiryInDays <= 30 ? 'Blocked' : 'Available';

      await prisma.branchStock.upsert({
        where: { branchId_batchId: { branchId: branch.id, batchId: batch.id } },
        update: { quantity, status },
        create: {
          tenantId: demoTenantRecord.id,
          branchId: branch.id,
          batchId: batch.id,
          quantity,
          status,
        },
      });
    }
  }

  const invoiceRecords: Array<{ id: string; supplierId: string }> = [];
  for (const entry of seedInvoices) {
    const supplier = suppliers[entry.supplierIndex];
    if (!supplier) continue;

    const invoice = await prisma.invoice.upsert({
      where: {
        tenantId_invoiceNumber: {
          tenantId: demoTenantRecord.id,
          invoiceNumber: entry.invoiceNumber,
        },
      },
      update: {
        supplierId: supplier.id,
        invoiceDate: addDays(-entry.daysAgo),
        subtotal: entry.subtotal,
        gstAmount: entry.gstAmount,
        totalAmount: entry.totalAmount,
        status: entry.status,
      },
      create: {
        tenantId: demoTenantRecord.id,
        supplierId: supplier.id,
        invoiceNumber: entry.invoiceNumber,
        invoiceDate: addDays(-entry.daysAgo),
        subtotal: entry.subtotal,
        gstAmount: entry.gstAmount,
        totalAmount: entry.totalAmount,
        status: entry.status,
      },
    });

    invoiceRecords.push({ id: invoice.id, supplierId: supplier.id });
  }

  const supplierInvoiceCursor = new Map<string, number>();
  for (const entry of batchRecords) {
    const supplierInvoices = invoiceRecords.filter((invoice) => invoice.supplierId === entry.supplierId);
    if (supplierInvoices.length === 0) continue;

    const currentIdx = supplierInvoiceCursor.get(entry.supplierId) || 0;
    const invoice = supplierInvoices[currentIdx % supplierInvoices.length];
    supplierInvoiceCursor.set(entry.supplierId, currentIdx + 1);

    await prisma.batch.update({
      where: { id: entry.batch.id },
      data: { invoiceId: invoice.id },
    });
  }

  const adminUser = await prisma.user.findFirst({
    where: { tenantId: demoTenantRecord.id, email: demoTenant.email },
  });

  if (adminUser && seededBranches.length > 0) {
    for (const [branchIndex, branch] of seededBranches.entries()) {
      for (let day = 0; day < 30; day += 1) {
        // Realistic daily sales: 8-15 transactions per day (weekend slightly less)
        const isWeekend = (day % 7) === 5 || (day % 7) === 6;
        const baseTransactions = isWeekend ? 8 : 12;
        const salesPerDay = baseTransactions + Math.floor(Math.random() * 4);

        for (let saleIndex = 0; saleIndex < salesPerDay; saleIndex += 1) {
          const customer = customers[(day * 13 + saleIndex * 7) % customers.length];
          const transactionDate = addDays(-day);
          // Random transaction times between 8 AM and 8 PM
          const hour = 8 + Math.floor(Math.random() * 12);
          const minute = Math.floor(Math.random() * 60);
          transactionDate.setHours(hour, minute, 0, 0);
          const note = `SEED_TXN_${branch.id}_${day}_${saleIndex}`;

          await prisma.$transaction(async (tx) => {
            const availableStocks = await tx.branchStock.findMany({
              where: {
                tenantId: demoTenantRecord.id,
                branchId: branch.id,
                quantity: { gt: 0 },
                status: 'Available',
              },
              include: {
                batch: {
                  include: { medicine: true },
                },
              },
              orderBy: { batch: { expiryDate: 'asc' } },
              take: 10,
            });

            if (availableStocks.length === 0) return;

            // 1-4 items per transaction
            const itemCount = 1 + Math.floor(Math.random() * 4);
            const selectedStocks = availableStocks.slice(0, Math.min(itemCount, availableStocks.length));
            const transactionItems: Array<{ batchId: string; quantity: number; unitPrice: number; lineTotal: number }> = [];
            let subtotal = 0;
            let gstAmount = 0;

            for (const stock of selectedStocks) {
              const quantity = Math.min(stock.quantity, 1 + Math.floor(Math.random() * 4));
              if (quantity <= 0) continue;

              const lineTotal = stock.batch.sellingPrice * quantity;
              const lineGst = (lineTotal * stock.batch.medicine.gstRate) / 100;
              subtotal += lineTotal;
              gstAmount += lineGst;
              transactionItems.push({
                batchId: stock.batchId,
                quantity,
                unitPrice: stock.batch.sellingPrice,
                lineTotal,
              });

              await tx.branchStock.update({
                where: { id: stock.id },
                data: {
                  quantity: { decrement: quantity },
                  status: stock.quantity - quantity === 0 ? 'Exhausted' : stock.status,
                },
              });

              await tx.batch.update({
                where: { id: stock.batchId },
                data: { quantity: { decrement: quantity } },
              });
            }

            if (transactionItems.length === 0) return;

            // Random discount on larger purchases
            const discountAmount = subtotal > 1000 && Math.random() > 0.7 ? Math.floor(subtotal * 0.05) : 0;

            await tx.pOSTransaction.create({
              data: {
                tenantId: demoTenantRecord.id,
                branchId: branch.id,
                userId: adminUser.id,
                customerId: customer?.id,
                items: {
                  create: transactionItems,
                },
                subtotal,
                discountAmount,
                gstAmount,
                totalAmount: subtotal + gstAmount - discountAmount,
                paymentMethod: saleIndex % 3 === 0 ? 'CASH' : saleIndex % 3 === 1 ? 'UPI' : 'CARD',
                paymentStatus: 'COMPLETED',
                transactionDate,
                notes: note,
              },
            });
          });
        }
      }
    }

    for (const [branchIndex, branch] of seededBranches.entries()) {
      const rxCountPerBranch = 2;

      for (let rxIndex = 0; rxIndex < rxCountPerBranch; rxIndex += 1) {
        const customer = customers[(branchIndex * 3 + rxIndex) % customers.length];
        if (!customer) continue;

        const prescription = await prisma.prescription.create({
          data: {
            tenantId: demoTenantRecord.id,
            customerId: customer.id,
            doctorName: rxIndex % 2 === 0 ? 'Dr. Prakash Kulkarni' : 'Dr. Meera Joshi',
            clinicName: branch.name,
            medicineRequested: ['Metformin 500', 'Amlodipine 5mg'],
            quantity: [10, 10],
            issueDate: addDays(-(2 + rxIndex)),
            expiryDate: addDays(28),
            verificationStatus: rxIndex % 2 === 0 ? 'PENDING' : 'VERIFIED',
            documentUrl: `seed-rx://${branch.id}/${rxIndex}`,
          },
        });

        const rxNote = `SEED_RX_TXN_${branch.id}_${rxIndex}`;

        await prisma.$transaction(async (tx) => {
          const availableStocks = await tx.branchStock.findMany({
            where: {
              tenantId: demoTenantRecord.id,
              branchId: branch.id,
              quantity: { gt: 0 },
              status: 'Available',
            },
            include: {
              batch: {
                include: { medicine: true },
              },
            },
            orderBy: { batch: { expiryDate: 'asc' } },
            take: 3,
          });

          if (availableStocks.length === 0) return;

          const transactionItems: Array<{ batchId: string; quantity: number; unitPrice: number; lineTotal: number }> = [];
          let subtotal = 0;
          let gstAmount = 0;

          for (const stock of availableStocks.slice(0, 2)) {
            const qty = Math.min(stock.quantity, 1);
            if (qty <= 0) continue;

            const lineTotal = stock.batch.sellingPrice * qty;
            subtotal += lineTotal;
            gstAmount += (lineTotal * stock.batch.medicine.gstRate) / 100;
            transactionItems.push({
              batchId: stock.batchId,
              quantity: qty,
              unitPrice: stock.batch.sellingPrice,
              lineTotal,
            });

            await tx.branchStock.update({
              where: { id: stock.id },
              data: {
                quantity: { decrement: qty },
                status: stock.quantity - qty === 0 ? 'Exhausted' : stock.status,
              },
            });

            await tx.batch.update({
              where: { id: stock.batchId },
              data: { quantity: { decrement: qty } },
            });
          }

          if (transactionItems.length === 0) return;

          await tx.pOSTransaction.create({
            data: {
              tenantId: demoTenantRecord.id,
              branchId: branch.id,
              userId: adminUser.id,
              customerId: customer.id,
              prescriptionId: prescription.id,
              items: { create: transactionItems },
              subtotal,
              discountAmount: 0,
              gstAmount,
              totalAmount: subtotal + gstAmount,
              paymentMethod: 'UPI',
              paymentStatus: 'COMPLETED',
              transactionDate: addDays(-rxIndex),
              notes: rxNote,
            },
          });
        });
      }
    }
  }
}
