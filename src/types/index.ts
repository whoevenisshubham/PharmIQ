// Core TypeScript interfaces for IPMS

export type ScheduleType = 'OTC' | 'H' | 'H1' | 'X';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Split';
export type BatchStatus = 'Available' | 'Blocked' | 'Expired' | 'Exhausted';
export type TableDensity = 'compact' | 'comfortable';
export type Theme = 'dark' | 'light' | 'system';

export interface Medicine {
    id: string;
    brandName: string;
    genericName: string;
    category: string;
    packSize: string;
    manufacturer: string;
    hsnCode: string;
    gstRate: 5 | 12 | 18;
    scheduleType: ScheduleType;
    reorderPoint: number;
    createdAt: string;
    imageUrl?: string;
}

export interface Batch {
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
    status: BatchStatus;
}

export interface SaleItem {
    medicineId: string;
    batchId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    gstRate: number;
    prescriptionId?: string;
}

export interface Sale {
    id: string;
    invoiceNo: string;
    customerId?: string;
    customerName?: string;
    items: SaleItem[];
    subtotal: number;
    totalGst: number;
    discount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    createdAt: string;
    createdBy: string;
    tenantId: string;
}

export interface OCRLineItem {
    id: string;
    rawText: string;
    mappedMedicineId?: string;
    mappedMedicineName?: string;
    batchNo: string;
    expiryDate: string;
    quantity: number;
    unitRate: number;
    gstRate: number;
    confidence: number;
}

export interface OCRInvoice {
    id: string;
    supplierId?: string;
    supplierName?: string;
    supplierGstin?: string;
    invoiceNo: string;
    invoiceDate: string;
    rawImageUrl: string;
    totalAmount: number;
    status: 'Pending' | 'Verified' | 'Confirmed';
    lineItems: OCRLineItem[];
}

export interface Supplier {
    id: string;
    name: string;
    gstin: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    totalPurchases: number;
    outstanding: number;
    lastOrderDate: string;
    status: 'Active' | 'Inactive';
    drugLicenseNo?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
    totalSpent: number;
    totalVisits: number;
    lastVisitDate: string;
    tags: CustomerTag[];
    loyaltyPoints: number;
    tenantId: string;
    createdAt: string;
}

export type CustomerTag = 'Diabetic' | 'Hypertensive' | 'Asthma' | 'Cardiac' | 'Elderly' | 'Oncology';

export interface Prescription {
    id: string;
    customerId: string;
    customerName: string;
    doctorName: string;
    mciRegNo: string;
    prescriptionDate: string;
    imageUrl: string;
    medicines: string[];
    status: 'Active' | 'Dispensed' | 'Expired' | 'Pending Review';
    linkedSaleId?: string;
    createdAt: string;
}

export interface Tenant {
    id: string;
    name: string;
    branchName: string;
    city: string;
    gstin: string;
    drugLicenseNo: string;
    isActive: boolean;
    address: string;
    phone: string;
    email: string;
}

export interface CartItem {
    medicine: Medicine;
    batch: Batch;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    prescriptionId?: string;
}

export interface CartTotals {
    subtotal: number;
    gst: number;
    discount: number;
    grand: number;
}

export interface PaymentLine {
    method: PaymentMethod;
    amount: number;
    reference?: string;
}

export interface KPIData {
    label: string;
    value: string | number;
    delta?: number;
    deltaLabel?: string;
    deltaPositive?: boolean;
    secondary?: string;
    color?: string;
    sparklineData?: number[];
}

export interface SalesDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    role: string;
    module: string;
    action: string;
    ipAddress: string;
    details: string;
}

export interface TransferItem {
    medicineId: string;
    medicine: Medicine;
    batch: Batch;
    quantity: number;
    availableQty: number;
}

export interface Transfer {
    id: string;
    sourceTenantId: string;
    destinationTenantId: string;
    items: TransferItem[];
    status: 'Initiated' | 'In Transit' | 'Received' | 'Confirmed';
    createdAt: string;
    updatedAt: string;
    notes?: string;
}

export interface NotificationAlert {
    id: string;
    type: 'low_stock' | 'near_expiry' | 'prescription';
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    createdAt: string;
    isRead: boolean;
    actionUrl?: string;
}

export interface InventoryItem {
    medicine: Medicine;
    batch: Batch;
    supplier: Supplier;
}
