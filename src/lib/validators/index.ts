import { z } from 'zod';

// GST Invoice validation
export const gstInvoiceSchema = z.object({
    supplierGstin: z
        .string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Invalid GSTIN format'
        ),
    invoiceNo: z.string().min(1, 'Invoice number required').max(16, 'Max 16 characters'),
    invoiceDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    supplierName: z.string().min(2, 'Supplier name required'),
    totalAmount: z.number().positive('Amount must be positive'),
});

// Batch entry validation
export const batchSchema = z.object({
    batchNo: z.string().min(2, 'Min 2 chars').max(20, 'Max 20 chars'),
    expiryDate: z
        .string()
        .refine(
            (d) => new Date(d) > new Date(),
            'Batch already expired'
        ),
    quantity: z.number().int().positive('Must be positive integer'),
    unitRate: z.number().positive('Must be positive'),
    gstRate: z.union([z.literal(5), z.literal(12), z.literal(18)]),
    medicineId: z.string().min(1),
    mrp: z.number().positive('MRP must be positive'),
});

// Prescription for Schedule H
export const prescriptionSchema = z.object({
    doctorName: z.string().min(2, 'Doctor name required'),
    mciRegNo: z.string().min(5, 'MCI registration number required'),
    prescriptionDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    imageUrl: z.string().url('Must be a valid URL').or(z.string().startsWith('data:')),
});

// Customer validation
export const customerSchema = z.object({
    name: z.string().min(2, 'Name required'),
    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

// Payment validation
export const paymentSchema = z.object({
    method: z.enum(['Cash', 'UPI', 'Card', 'Split']),
    cashTendered: z.number().optional(),
    upiReference: z.string().optional(),
    cardLast4: z.string().length(4).optional(),
    splitLines: z
        .array(
            z.object({
                method: z.enum(['Cash', 'UPI', 'Card']),
                amount: z.number().positive(),
                reference: z.string().optional(),
            })
        )
        .optional(),
});

// Medicine master validation
export const medicineSchema = z.object({
    brandName: z.string().min(2, 'Brand name required'),
    genericName: z.string().min(2, 'Generic name required'),
    category: z.string().min(1, 'Category required'),
    packSize: z.string().min(1, 'Pack size required'),
    manufacturer: z.string().min(2, 'Manufacturer required'),
    hsnCode: z.string().min(4, 'HSN code required'),
    gstRate: z.union([z.literal(5), z.literal(12), z.literal(18)]),
    scheduleType: z.enum(['OTC', 'H', 'H1', 'X']),
    reorderPoint: z.number().int().min(0),
});

// Supplier validation
export const supplierSchema = z.object({
    name: z.string().min(2, 'Supplier name required'),
    gstin: z
        .string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Invalid GSTIN format'
        ),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile number required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().min(5, 'Address required'),
    city: z.string().min(2, 'City required'),
});

// Store settings validation
export const storeSettingsSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
    drugLicenseNo: z.string().min(5),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email(),
});

export type GstInvoiceFormData = z.infer<typeof gstInvoiceSchema>;
export type BatchFormData = z.infer<typeof batchSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type MedicineFormData = z.infer<typeof medicineSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
