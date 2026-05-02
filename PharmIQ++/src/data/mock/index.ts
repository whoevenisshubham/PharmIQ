import { Medicine, Batch, Supplier, Customer, Sale, Tenant, Prescription, OCRInvoice, AuditLog, NotificationAlert } from '@/types';

// ─── Tenants ────────────────────────────────────────────────────────────────
export const mockTenants: Tenant[] = [
    { id: 'T001', name: 'PharmEZ', branchName: 'Pune - Main Branch', city: 'Pune', gstin: '27AADCB2230M1ZT', drugLicenseNo: 'MH-PUN-2021-0042', isActive: true, address: '12, FC Road, Deccan, Pune 411004', phone: '9876543210', email: 'pune.main@pharmez.in' },
    { id: 'T002', name: 'PharmEZ', branchName: 'Pune - Kothrud', city: 'Pune', gstin: '27AADCB2230M1ZT', drugLicenseNo: 'MH-PUN-2021-0043', isActive: true, address: '45, Paud Road, Kothrud, Pune 411038', phone: '9876543211', email: 'pune.kothrud@pharmez.in' },
    { id: 'T003', name: 'PharmEZ', branchName: 'Pune - Baner', city: 'Pune', gstin: '27AADCB2230M1ZT', drugLicenseNo: 'MH-PUN-2021-0044', isActive: false, address: '78, Baner Road, Baner, Pune 411045', phone: '9876543212', email: 'pune.baner@pharmez.in' },
    { id: 'T004', name: 'PharmEZ', branchName: 'Mumbai - Andheri', city: 'Mumbai', gstin: '27AADCB2230M2ZT', drugLicenseNo: 'MH-MUM-2021-0091', isActive: true, address: '23, Veera Desai Rd, Andheri West, Mumbai 400053', phone: '9876543213', email: 'mumbai.andheri@pharmez.in' },
    { id: 'T005', name: 'PharmEZ', branchName: 'Nashik - College Road', city: 'Nashik', gstin: '27AADCB2230M3ZT', drugLicenseNo: 'MH-NSK-2021-0015', isActive: true, address: '5, College Road, Nashik 422005', phone: '9876543214', email: 'nashik@pharmez.in' },
];

// ─── Categories ──────────────────────────────────────────────────────────────
const categories = ['Cardiac', 'Antibiotics', 'Vitamins', 'Antidiabetic', 'Analgesics', 'Antihypertensive', 'Cough & Cold', 'Antiallergic', 'Gastrointestinal', 'Oncology'];

// ─── Medicines ───────────────────────────────────────────────────────────────
export const mockMedicines: Medicine[] = [
    { id: 'M001', brandName: 'Metformin 500', genericName: 'Metformin HCl', category: 'Antidiabetic', packSize: '10×10 tabs', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 50, createdAt: '2024-01-01' },
    { id: 'M002', brandName: 'Glimepiride 2mg', genericName: 'Glimepiride', category: 'Antidiabetic', packSize: '10×10 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 30, createdAt: '2024-01-01' },
    { id: 'M003', brandName: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', packSize: '10×10 tabs', manufacturer: 'Lupin Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 40, createdAt: '2024-01-01' },
    { id: 'M004', brandName: 'Telmisartan 40mg', genericName: 'Telmisartan', category: 'Cardiac', packSize: '10×14 tabs', manufacturer: 'Dr Reddys', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 30, createdAt: '2024-01-01' },
    { id: 'M005', brandName: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotics', packSize: '10×10 caps', manufacturer: 'Alkem Labs', hsnCode: '30041099', gstRate: 12, scheduleType: 'H', reorderPoint: 25, createdAt: '2024-01-01' },
    { id: 'M006', brandName: 'Azithromycin 500', genericName: 'Azithromycin', category: 'Antibiotics', packSize: '3 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30041099', gstRate: 12, scheduleType: 'H', reorderPoint: 20, createdAt: '2024-01-01' },
    { id: 'M007', brandName: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Cardiac', packSize: '10×10 tabs', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 35, createdAt: '2024-01-01' },
    { id: 'M008', brandName: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antiallergic', packSize: '10×10 tabs', manufacturer: 'Torrent Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderPoint: 40, createdAt: '2024-01-01' },
    { id: 'M009', brandName: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Gastrointestinal', packSize: '10×15 tabs', manufacturer: 'Zydus Cadila', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 30, createdAt: '2024-01-01' },
    { id: 'M010', brandName: 'Paracetamol 500', genericName: 'Paracetamol', category: 'Analgesics', packSize: '10×10 tabs', manufacturer: 'Mankind Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderPoint: 100, createdAt: '2024-01-01' },
    { id: 'M011', brandName: 'Losartan 50mg', genericName: 'Losartan Potassium', category: 'Antihypertensive', packSize: '10×10 tabs', manufacturer: 'Cipla Ltd', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 30, createdAt: '2024-01-01' },
    { id: 'M012', brandName: 'Clopidogrel 75mg', genericName: 'Clopidogrel', category: 'Cardiac', packSize: '10×10 tabs', manufacturer: 'Intas Pharma', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 25, createdAt: '2024-01-01' },
    { id: 'M013', brandName: 'Vitamin D3 60K', genericName: 'Cholecalciferol', category: 'Vitamins', packSize: '4 caps', manufacturer: 'Sun Pharma', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderPoint: 60, createdAt: '2024-01-01' },
    { id: 'M014', brandName: 'Biotin 10mg', genericName: 'Biotin (Vit B7)', category: 'Vitamins', packSize: '30 tabs', manufacturer: 'Lupin Ltd', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderPoint: 40, createdAt: '2024-01-01' },
    { id: 'M015', brandName: 'Montelukast 10mg', genericName: 'Montelukast Sodium', category: 'Antiallergic', packSize: '10×10 tabs', manufacturer: 'Glenmark', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 25, createdAt: '2024-01-01' },
    { id: 'M016', brandName: 'Dolo 650', genericName: 'Paracetamol', category: 'Analgesics', packSize: '10×15 tabs', manufacturer: 'Micro Labs', hsnCode: '30049099', gstRate: 5, scheduleType: 'OTC', reorderPoint: 150, createdAt: '2024-01-01' },
    { id: 'M017', brandName: 'Rabeprazole 20mg', genericName: 'Rabeprazole Sodium', category: 'Gastrointestinal', packSize: '10×10 tabs', manufacturer: 'Zydus Cadila', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 30, createdAt: '2024-01-01' },
    { id: 'M018', brandName: 'Tramadol 50mg', genericName: 'Tramadol HCl', category: 'Analgesics', packSize: '10×10 tabs', manufacturer: 'Mankind Pharma', hsnCode: '30049099', gstRate: 18, scheduleType: 'H1', reorderPoint: 10, createdAt: '2024-01-01' },
    { id: 'M019', brandName: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Antidiabetic', packSize: '1 vial (10ml)', manufacturer: 'Sanofi', hsnCode: '30043910', gstRate: 5, scheduleType: 'H', reorderPoint: 5, createdAt: '2024-01-01' },
    { id: 'M020', brandName: 'Salbutamol 4mg', genericName: 'Salbutamol Sulfate', category: 'Cough & Cold', packSize: '10×10 tabs', manufacturer: 'GSK India', hsnCode: '30049099', gstRate: 12, scheduleType: 'H', reorderPoint: 20, createdAt: '2024-01-01' },
];

// ─── Suppliers ───────────────────────────────────────────────────────────────
export const mockSuppliers: Supplier[] = [
    { id: 'S001', name: 'Medline Distributors', gstin: '27AABCM1234A1ZK', phone: '9823456781', email: 'orders@medline.in', address: 'Plot 12, MIDC, Bhosari', city: 'Pune', totalPurchases: 1245000, outstanding: 125000, lastOrderDate: '2026-03-08', status: 'Active' },
    { id: 'S002', name: 'HealthFirst Pharma', gstin: '27AABHF5678B1ZM', phone: '9823456782', email: 'sales@healthfirst.in', address: '23, Bund Garden Road', city: 'Pune', totalPurchases: 985000, outstanding: 45000, lastOrderDate: '2026-03-05', status: 'Active' },
    { id: 'S003', name: 'Apollo Wholesale', gstin: '27AACPA9123C1ZN', phone: '9823456783', email: 'wholesale@apollo.in', address: '5, APMC Road', city: 'Mumbai', totalPurchases: 789000, outstanding: 0, lastOrderDate: '2026-02-28', status: 'Active' },
    { id: 'S004', name: 'Cipla Direct', gstin: '27AADCD4567D1ZP', phone: '9823456784', email: 'direct@cipla.com', address: '48, Vile Parle East', city: 'Mumbai', totalPurchases: 2340000, outstanding: 340000, lastOrderDate: '2026-03-10', status: 'Active' },
    { id: 'S005', name: 'Sun Pharma Depot', gstin: '27AAECS8901E1ZQ', phone: '9823456785', email: 'depot@sunpharma.com', address: '7, Goregaon East', city: 'Mumbai', totalPurchases: 1870000, outstanding: 200000, lastOrderDate: '2026-03-01', status: 'Active' },
    { id: 'S006', name: 'Nashik Medi Supply', gstin: '27AAFEN2345F1ZR', phone: '9823456786', email: 'info@nashikmedi.in', address: '12, Pathardi Road', city: 'Nashik', totalPurchases: 340000, outstanding: 15000, lastOrderDate: '2026-02-20', status: 'Inactive' },
];

// ─── Batches ─────────────────────────────────────────────────────────────────
const today = new Date();
const addDays = (d: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
};

export const mockBatches: Batch[] = [
    // Healthy
    { id: 'B001', medicineId: 'M001', batchNo: 'MET2023001', expiryDate: addDays(400), manufacturingDate: addDays(-200), quantity: 200, purchaseRate: 28, mrp: 45, supplierId: 'S001', invoiceId: 'INV001', status: 'Available' },
    { id: 'B002', medicineId: 'M001', batchNo: 'MET2024A12', expiryDate: addDays(600), manufacturingDate: addDays(-60), quantity: 150, purchaseRate: 27, mrp: 45, supplierId: 'S001', invoiceId: 'INV002', status: 'Available' },
    { id: 'B003', medicineId: 'M002', batchNo: 'GLI2024B01', expiryDate: addDays(450), manufacturingDate: addDays(-90), quantity: 120, purchaseRate: 38, mrp: 65, supplierId: 'S002', invoiceId: 'INV003', status: 'Available' },
    { id: 'B004', medicineId: 'M003', batchNo: 'AML2024C03', expiryDate: addDays(380), manufacturingDate: addDays(-150), quantity: 80, purchaseRate: 52, mrp: 90, supplierId: 'S003', invoiceId: 'INV004', status: 'Available' },
    { id: 'B005', medicineId: 'M004', batchNo: 'TEL2024D01', expiryDate: addDays(500), manufacturingDate: addDays(-80), quantity: 100, purchaseRate: 44, mrp: 75, supplierId: 'S004', invoiceId: 'INV005', status: 'Available' },
    { id: 'B006', medicineId: 'M005', batchNo: 'AMX2024E02', expiryDate: addDays(350), manufacturingDate: addDays(-100), quantity: 60, purchaseRate: 72, mrp: 125, supplierId: 'S005', invoiceId: 'INV006', status: 'Available' },
    { id: 'B007', medicineId: 'M006', batchNo: 'AZI2024F03', expiryDate: addDays(300), manufacturingDate: addDays(-120), quantity: 90, purchaseRate: 28, mrp: 55, supplierId: 'S001', invoiceId: 'INV007', status: 'Available' },
    { id: 'B008', medicineId: 'M007', batchNo: 'ATO2024G01', expiryDate: addDays(480), manufacturingDate: addDays(-70), quantity: 110, purchaseRate: 18, mrp: 32, supplierId: 'S002', invoiceId: 'INV008', status: 'Available' },
    { id: 'B009', medicineId: 'M008', batchNo: 'CET2024H02', expiryDate: addDays(420), manufacturingDate: addDays(-110), quantity: 200, purchaseRate: 8, mrp: 15, supplierId: 'S003', invoiceId: 'INV009', status: 'Available' },
    { id: 'B010', medicineId: 'M009', batchNo: 'PAN2024I01', expiryDate: addDays(360), manufacturingDate: addDays(-130), quantity: 75, purchaseRate: 35, mrp: 62, supplierId: 'S004', invoiceId: 'INV010', status: 'Available' },
    // Near expiry (≤30 days)
    { id: 'B011', medicineId: 'M010', batchNo: 'PAR2024J01', expiryDate: addDays(25), manufacturingDate: addDays(-340), quantity: 300, purchaseRate: 2, mrp: 4, supplierId: 'S005', invoiceId: 'INV011', status: 'Available' },
    { id: 'B012', medicineId: 'M011', batchNo: 'LOS2024K01', expiryDate: addDays(15), manufacturingDate: addDays(-350), quantity: 45, purchaseRate: 22, mrp: 40, supplierId: 'S001', invoiceId: 'INV012', status: 'Available' },
    { id: 'B013', medicineId: 'M012', batchNo: 'CLO2024L01', expiryDate: addDays(20), manufacturingDate: addDays(-345), quantity: 60, purchaseRate: 48, mrp: 85, supplierId: 'S002', invoiceId: 'INV013', status: 'Available' },
    // Near expiry (≤90 days)
    { id: 'B014', medicineId: 'M013', batchNo: 'VIT2024M01', expiryDate: addDays(75), manufacturingDate: addDays(-290), quantity: 80, purchaseRate: 42, mrp: 80, supplierId: 'S003', invoiceId: 'INV014', status: 'Available' },
    { id: 'B015', medicineId: 'M014', batchNo: 'BIO2024N01', expiryDate: addDays(60), manufacturingDate: addDays(-305), quantity: 50, purchaseRate: 25, mrp: 45, supplierId: 'S004', invoiceId: 'INV015', status: 'Available' },
    // Expired
    { id: 'B016', medicineId: 'M015', batchNo: 'MON2023A01', expiryDate: addDays(-30), manufacturingDate: addDays(-730), quantity: 20, purchaseRate: 55, mrp: 98, supplierId: 'S005', invoiceId: 'INV016', status: 'Expired' },
    { id: 'B017', medicineId: 'M016', batchNo: 'DOL2022B01', expiryDate: addDays(-60), manufacturingDate: addDays(-760), quantity: 50, purchaseRate: 4, mrp: 7, supplierId: 'S001', invoiceId: 'INV017', status: 'Expired' },
    // Blocked
    { id: 'B018', medicineId: 'M017', batchNo: 'RAB2024P01', expiryDate: addDays(200), manufacturingDate: addDays(-165), quantity: 30, purchaseRate: 38, mrp: 68, supplierId: 'S002', invoiceId: 'INV018', status: 'Blocked' },
    // More healthy
    { id: 'B019', medicineId: 'M018', batchNo: 'TRA2024Q01', expiryDate: addDays(500), manufacturingDate: addDays(-65), quantity: 20, purchaseRate: 35, mrp: 62, supplierId: 'S003', invoiceId: 'INV019', status: 'Available' },
    { id: 'B020', medicineId: 'M019', batchNo: 'INS2024R01', expiryDate: addDays(180), manufacturingDate: addDays(-185), quantity: 8, purchaseRate: 850, mrp: 1200, supplierId: 'S004', invoiceId: 'INV020', status: 'Available' },
    { id: 'B021', medicineId: 'M020', batchNo: 'SAL2024S01', expiryDate: addDays(420), manufacturingDate: addDays(-105), quantity: 40, purchaseRate: 12, mrp: 22, supplierId: 'S005', invoiceId: 'INV021', status: 'Available' },
    // Low stock batches
    { id: 'B022', medicineId: 'M001', batchNo: 'MET2024T02', expiryDate: addDays(550), manufacturingDate: addDays(-50), quantity: 8, purchaseRate: 28, mrp: 45, supplierId: 'S001', invoiceId: 'INV022', status: 'Available' },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
    { id: 'C001', name: 'Rajesh Sharma', phone: '9876543220', email: 'rajesh.sharma@email.com', totalSpent: 12450, totalVisits: 24, lastVisitDate: '2026-03-10', tags: ['Diabetic', 'Hypertensive'], loyaltyPoints: 1245, tenantId: 'T001', createdAt: '2024-06-15' },
    { id: 'C002', name: 'Sunita Patel', phone: '9876543221', email: 'sunita.patel@email.com', totalSpent: 8320, totalVisits: 18, lastVisitDate: '2026-03-09', tags: ['Cardiac', 'Elderly'], loyaltyPoints: 832, tenantId: 'T001', createdAt: '2024-08-20' },
    { id: 'C003', name: 'Amit Kulkarni', phone: '9876543222', totalSpent: 3450, totalVisits: 8, lastVisitDate: '2026-03-05', tags: ['Asthma'], loyaltyPoints: 345, tenantId: 'T001', createdAt: '2025-01-10' },
    { id: 'C004', name: 'Priya Desai', phone: '9876543223', email: 'priya.desai@email.com', totalSpent: 22100, totalVisits: 45, lastVisitDate: '2026-03-11', tags: ['Diabetic', 'Cardiac', 'Hypertensive'], loyaltyPoints: 2210, tenantId: 'T001', createdAt: '2023-11-01' },
    { id: 'C005', name: 'Mohit Joshi', phone: '9876543224', totalSpent: 1200, totalVisits: 3, lastVisitDate: '2026-02-25', tags: [], loyaltyPoints: 120, tenantId: 'T001', createdAt: '2026-01-15' },
    { id: 'C006', name: 'Kavitha Nair', phone: '9876543225', email: 'kavitha.nair@email.com', totalSpent: 15800, totalVisits: 32, lastVisitDate: '2026-03-08', tags: ['Elderly', 'Hypertensive'], loyaltyPoints: 1580, tenantId: 'T001', createdAt: '2024-03-22' },
    { id: 'C007', name: 'Suresh Mehta', phone: '9876543226', totalSpent: 45600, totalVisits: 89, lastVisitDate: '2026-03-11', tags: ['Diabetic', 'Cardiac'], loyaltyPoints: 4560, tenantId: 'T001', createdAt: '2023-05-10' },
    { id: 'C008', name: 'Anita Singh', phone: '9876543227', email: 'anita.singh@email.com', totalSpent: 6700, totalVisits: 14, lastVisitDate: '2026-03-07', tags: ['Asthma', 'Elderly'], loyaltyPoints: 670, tenantId: 'T001', createdAt: '2025-02-28' },
];

// ─── Sales History ────────────────────────────────────────────────────────────
export const mockSales: Sale[] = Array.from({ length: 50 }, (_, i) => {
    const daysAgo = Math.floor(i / 3);
    const dt = new Date(today);
    dt.setDate(dt.getDate() - daysAgo);
    return {
        id: `SAL${String(i + 1).padStart(4, '0')}`,
        invoiceNo: `PZ-2026-${String(1000 + i + 1)}`,
        customerId: mockCustomers[i % mockCustomers.length].id,
        customerName: mockCustomers[i % mockCustomers.length].name,
        items: [
            { medicineId: mockMedicines[i % 10].id, batchId: `B00${(i % 9) + 1}`, quantity: Math.ceil(Math.random() * 3) + 1, unitPrice: 45 + (i % 5) * 10, discount: 0, gstRate: 12 },
        ],
        subtotal: 450 + (i % 20) * 50,
        totalGst: 54 + (i % 20) * 6,
        discount: i % 5 === 0 ? 50 : 0,
        grandTotal: 454 + (i % 20) * 56,
        paymentMethod: (['Cash', 'UPI', 'Card'] as const)[i % 3],
        createdAt: dt.toISOString(),
        createdBy: 'pharmacist@pharmez.in',
        tenantId: 'T001',
    };
});

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const mockPrescriptions: Prescription[] = [
    { id: 'RX001', customerId: 'C001', customerName: 'Rajesh Sharma', doctorName: 'Dr. Anand Kulkarni', mciRegNo: 'MH-45231', prescriptionDate: '2026-03-08', imageUrl: 'https://placehold.co/400x600/1f2937/9ca3af?text=Rx+001', medicines: ['Metformin 500', 'Atorvastatin 10mg'], status: 'Active', createdAt: '2026-03-08' },
    { id: 'RX002', customerId: 'C004', customerName: 'Priya Desai', doctorName: 'Dr. Meena Sharma', mciRegNo: 'MH-12876', prescriptionDate: '2026-03-09', imageUrl: 'https://placehold.co/400x600/1f2937/9ca3af?text=Rx+002', medicines: ['Glimepiride 2mg', 'Amlodipine 5mg'], status: 'Dispensed', linkedSaleId: 'SAL0012', createdAt: '2026-03-09' },
    { id: 'RX003', customerId: 'C007', customerName: 'Suresh Mehta', doctorName: 'Dr. Rohit Verma', mciRegNo: 'DL-78421', prescriptionDate: '2026-03-10', imageUrl: 'https://placehold.co/400x600/1f2937/9ca3af?text=Rx+003', medicines: ['Tramadol 50mg'], status: 'Active', createdAt: '2026-03-10' },
    { id: 'RX004', customerId: 'C002', customerName: 'Sunita Patel', doctorName: 'Dr. Priya Nair', mciRegNo: 'MH-56789', prescriptionDate: '2026-02-15', imageUrl: 'https://placehold.co/400x600/1f2937/9ca3af?text=Rx+004', medicines: ['Clopidogrel 75mg', 'Telmisartan 40mg'], status: 'Expired', createdAt: '2026-02-15' },
    { id: 'RX005', customerId: 'C006', customerName: 'Kavitha Nair', doctorName: 'Dr. Sushant Rao', mciRegNo: 'KA-34521', prescriptionDate: '2026-03-11', imageUrl: 'https://placehold.co/400x600/1f2937/9ca3af?text=Rx+005', medicines: ['Losartan 50mg'], status: 'Pending Review', createdAt: '2026-03-11' },
];

// ─── OCR Invoices ─────────────────────────────────────────────────────────────
export const mockOCRInvoices: OCRInvoice[] = [
    {
        id: 'OCR001', supplierId: 'S001', supplierName: 'Medline Distributors', supplierGstin: '27AABCM1234A1ZK',
        invoiceNo: 'MDL/2026/0342', invoiceDate: '2026-03-08', rawImageUrl: 'https://placehold.co/800x1100/1f2937/4b5563?text=Invoice+PDF+Page+1',
        totalAmount: 45230, status: 'Pending',
        lineItems: [
            { id: 'LI001', rawText: 'Metformin 500mg Tab', mappedMedicineId: 'M001', mappedMedicineName: 'Metformin 500', batchNo: 'MET2026A', expiryDate: addDays(720), quantity: 100, unitRate: 28, gstRate: 12, confidence: 98 },
            { id: 'LI002', rawText: 'Glirnrpiride 2rng Tab', mappedMedicineId: 'M002', mappedMedicineName: 'Glimepiride 2mg', batchNo: 'GLI2026B', expiryDate: addDays(680), quantity: 50, unitRate: 38, gstRate: 12, confidence: 72 },
            { id: 'LI003', rawText: 'Arnoxycillin 500 Caps', mappedMedicineId: 'M005', mappedMedicineName: 'Amoxicillin 500mg', batchNo: 'AMX2026C', expiryDate: addDays(540), quantity: 30, unitRate: 72, gstRate: 12, confidence: 81 },
            { id: 'LI004', rawText: 'Cetzrizine HCI 10mg Tabs', mappedMedicineId: 'M008', mappedMedicineName: 'Cetirizine 10mg', batchNo: 'CET2026D', expiryDate: addDays(600), quantity: 200, unitRate: 8, gstRate: 5, confidence: 65 },
            { id: 'LI005', rawText: 'Paracetmol 500 Tab', mappedMedicineId: 'M010', mappedMedicineName: 'Paracetamol 500', batchNo: 'PAR2026E', expiryDate: addDays(480), quantity: 500, unitRate: 2, gstRate: 5, confidence: 88 },
        ],
    },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
const modules = ['POS', 'Inventory', 'Procurement', 'Settings', 'Reports', 'Compliance'];
const actions = ['Created', 'Updated', 'Deleted', 'Exported', 'Viewed', 'Blocked', 'Approved'];
const users = [
    { id: 'U001', name: 'Ramesh Pharmacist', role: 'Pharmacist' },
    { id: 'U002', name: 'Admin Owner', role: 'Owner' },
    { id: 'U003', name: 'Seema Staff', role: 'Staff' },
];

export const mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => {
    const user = users[i % users.length];
    const dt = new Date(today);
    dt.setHours(dt.getHours() - i * 2);
    return {
        id: `AL${String(i + 1).padStart(4, '0')}`,
        timestamp: dt.toISOString(),
        userId: user.id,
        userName: user.name,
        role: user.role,
        module: modules[i % modules.length],
        action: actions[i % actions.length],
        ipAddress: `192.168.1.${(i % 50) + 1}`,
        details: `${actions[i % actions.length]} record in ${modules[i % modules.length]} module`,
    };
});

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: NotificationAlert[] = [
    { id: 'N001', type: 'low_stock', title: 'Low Stock: Metformin 500', description: 'Only 8 units remaining (reorder point: 50)', severity: 'critical', createdAt: new Date(today.getTime() - 3600000).toISOString(), isRead: false, actionUrl: '/inventory' },
    { id: 'N002', type: 'near_expiry', title: 'Near Expiry: Paracetamol 500', description: '300 units of batch PAR2024J01 expire in 25 days', severity: 'warning', createdAt: new Date(today.getTime() - 7200000).toISOString(), isRead: false, actionUrl: '/inventory/batches' },
    { id: 'N003', type: 'near_expiry', title: 'Near Expiry: Losartan 50mg', description: '45 units expire in 15 days — ₹1,800 at risk', severity: 'critical', createdAt: new Date(today.getTime() - 10800000).toISOString(), isRead: false, actionUrl: '/inventory/batches' },
    { id: 'N004', type: 'prescription', title: 'Prescription Pending Review', description: 'Kavitha Nair — Losartan 50mg — awaiting verification', severity: 'info', createdAt: new Date(today.getTime() - 14400000).toISOString(), isRead: true, actionUrl: '/prescriptions' },
    { id: 'N005', type: 'low_stock', title: 'Low Stock: Insulin Glargine', description: 'Only 8 vials remaining (reorder point: 5) — High priority', severity: 'warning', createdAt: new Date(today.getTime() - 18000000).toISOString(), isRead: false, actionUrl: '/inventory' },
];

// ─── Sparkline / Dashboard Data ───────────────────────────────────────────────
export const mockSalesSparkline = [4200, 5100, 4800, 6200, 5800, 7100, 6800];

export const mockSalesTrend = Array.from({ length: 90 }, (_, i) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - (89 - i));
    const base = 15000 + Math.random() * 8000;
    return {
        date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: Math.round(base),
        orders: Math.round(base / 450),
    };
});

export const mockCategoryBreakdown = [
    { name: 'Cardiac', value: 245000, color: '#ef4444' },
    { name: 'Antidiabetic', value: 198000, color: '#3b82f6' },
    { name: 'Antibiotics', value: 167000, color: '#10b981' },
    { name: 'Vitamins', value: 134000, color: '#f59e0b' },
    { name: 'Analgesics', value: 112000, color: '#8b5cf6' },
    { name: 'GI', value: 89000, color: '#06b6d4' },
    { name: 'Antiallergic', value: 76000, color: '#f97316' },
    { name: 'Others', value: 45000, color: '#6b7280' },
];

export const mockTopMedicines = [
    { name: 'Metformin 500', revenue: 48000, units: 1067 },
    { name: 'Atorvastatin 10mg', revenue: 42000, units: 1313 },
    { name: 'Amlodipine 5mg', revenue: 38500, units: 428 },
    { name: 'Telmisartan 40mg', revenue: 35000, units: 467 },
    { name: 'Glimepiride 2mg', revenue: 32000, units: 492 },
    { name: 'Pantoprazole 40mg', revenue: 28000, units: 452 },
    { name: 'Paracetamol 500', revenue: 25000, units: 6250 },
    { name: 'Dolo 650', revenue: 22000, units: 3143 },
    { name: 'Clopidogrel 75mg', revenue: 21000, units: 247 },
    { name: 'Amoxicillin 500mg', revenue: 18000, units: 144 },
];

export const mockStockAging = [
    { category: 'Cardiac', healthy: 80, expiring3m: 10, expiring6m: 5, dead: 2 },
    { category: 'Antidiabetic', healthy: 70, expiring3m: 15, expiring6m: 8, dead: 3 },
    { category: 'Antibiotics', healthy: 60, expiring3m: 20, expiring6m: 12, dead: 5 },
    { category: 'Vitamins', healthy: 55, expiring3m: 25, expiring6m: 8, dead: 2 },
    { category: 'Analgesics', healthy: 85, expiring3m: 8, expiring6m: 4, dead: 1 },
    { category: 'GI', healthy: 75, expiring3m: 12, expiring6m: 5, dead: 2 },
];
