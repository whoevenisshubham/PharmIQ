import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertOctagon, ShoppingCart, Trash2, Plus, Minus, CreditCard, Printer, CheckCircle } from 'lucide-react';
import { usePosStore } from '@/stores/posStore';
import { mockMedicines, mockBatches, mockCustomers } from '@/data/mock';
import { Medicine, Batch, Customer, Prescription } from '@/types';
import { fefoSort, isBatchExpired, daysUntilExpiry } from '@/lib/fefo';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { BatchStatusBadge, ScheduleBadge, Badge } from '@/components/common/Badge';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionSchema, PrescriptionFormData } from '@/lib/validators';

// ──────────────────────────────────────────────
// ExpiredBatchBlocker — Non-dismissible hard block
// ──────────────────────────────────────────────
function ExpiredBatchBlocker({ batch, medicine, onClose }: { batch: Batch; medicine: Medicine; onClose: () => void }) {
    const [isShaking, setIsShaking] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsShaking(false), 500);
        return () => clearTimeout(t);
    }, []);

    // Prevent any keyboard dismissal
    useEffect(() => {
        const prevent = (e: KeyboardEvent) => {
            if (e.key === 'Escape') e.stopPropagation();
        };
        window.addEventListener('keydown', prevent, true);
        return () => window.removeEventListener('keydown', prevent, true);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                animate={isShaking ? { x: [0, -10, 10, -8, 8, -4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-surface border-2 border-critical rounded-xl p-8 border-pulse-red shadow-2xl shadow-critical/20"
            >
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-critical/10 flex items-center justify-center">
                        <AlertOctagon className="w-8 h-8 text-critical" />
                    </div>
                </div>
                <h2 className="text-xl font-display font-bold text-critical text-center mb-2">
                    Sale Blocked
                </h2>
                <p className="text-center text-text-2 text-sm mb-6">
                    This batch is <strong className="text-critical">
                        {batch.status === 'Expired' ? 'EXPIRED' : 'BLOCKED'}
                    </strong> and cannot be sold.
                </p>
                <div className="bg-surface-2 rounded-lg p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-3">Medicine</span>
                        <span className="text-text-1 font-medium">{medicine.brandName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-3">Batch No</span>
                        <span className="font-mono text-text-1">{batch.batchNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-3">Expiry</span>
                        <span className="text-critical font-medium">{formatDate(batch.expiryDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-3">Status</span>
                        <BatchStatusBadge status={batch.status} />
                    </div>
                </div>
                <p className="text-xs text-text-3 text-center mb-5">
                    Contact your administrator to resolve this issue.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg bg-surface-2 text-text-2 hover:text-text-1 hover:bg-surface-2/80 text-sm font-medium transition-colors"
                    >
                        Scan Different Item
                    </button>
                    <button className="flex-1 py-2.5 rounded-lg border border-critical/30 text-critical text-sm font-medium hover:bg-critical/5 transition-colors">
                        Contact Admin
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ──────────────────────────────────────────────
// PrescriptionDrawer — Required for Schedule H/H1
// ──────────────────────────────────────────────
function PrescriptionDrawer({ medicine, onSubmit, onClose }: {
    medicine: Medicine;
    onSubmit: (data: PrescriptionFormData) => void;
    onClose: () => void;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<PrescriptionFormData>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: { prescriptionDate: new Date().toISOString().split('T')[0], imageUrl: 'https://placehold.co/400x600' },
    });

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-96 h-full bg-surface border-l border-border shadow-2xl flex flex-col"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <h3 className="font-display font-semibold text-text-1">Prescription Required</h3>
                            <p className="text-xs text-warning flex items-center gap-1 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                Schedule {medicine.scheduleType} drug
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-text-3 hover:text-text-1 hover:bg-surface-2 rounded-md">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs text-warning">
                            <strong>{medicine.brandName}</strong> is a Schedule {medicine.scheduleType} drug. A valid prescription from a registered doctor is mandatory.
                        </div>

                        <div className="space-y-3">
                            <FormField label="Doctor Name *" error={errors.doctorName?.message}>
                                <input {...register('doctorName')} placeholder="Dr. Anand Kulkarni" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none transition-colors" />
                            </FormField>
                            <FormField label="MCI Registration No *" error={errors.mciRegNo?.message}>
                                <input {...register('mciRegNo')} placeholder="MH-45231" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none font-mono transition-colors" />
                            </FormField>
                            <FormField label="Prescription Date *" error={errors.prescriptionDate?.message}>
                                <input type="date" {...register('prescriptionDate')} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none transition-colors" />
                            </FormField>
                            <FormField label="Upload Prescription" error={errors.imageUrl?.message}>
                                <div className="border-2 border-dashed border-border hover:border-primary/30 rounded-lg p-6 text-center cursor-pointer transition-colors">
                                    <p className="text-xs text-text-3">Drag & drop or click to upload</p>
                                    <p className="text-xs text-text-3 mt-1">PDF, JPG, PNG accepted</p>
                                    <input type="hidden" {...register('imageUrl')} />
                                </div>
                            </FormField>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-primary hover:bg-primary-dim text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Confirm & Link Prescription
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs text-text-2 font-medium mb-1 block">{label}</label>
            {children}
            {error && <p className="text-xs text-critical mt-1">{error}</p>}
        </div>
    );
}

// ──────────────────────────────────────────────
// BatchSelector
// ──────────────────────────────────────────────
function BatchSelector({ medicine, onSelect, onClose }: {
    medicine: Medicine;
    onSelect: (batch: Batch) => void;
    onClose: () => void;
}) {
    const batches = fefoSort(mockBatches.filter(b => b.medicineId === medicine.id));

    return (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-2xl z-30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <p className="text-xs font-medium text-text-2">Select Batch (FEFO sorted)</p>
                <button onClick={onClose} className="text-text-3 hover:text-text-2"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {batches.map((batch) => {
                    const expired = isBatchExpired(batch) || batch.status === 'Blocked' || batch.status === 'Expired';
                    const days = daysUntilExpiry(batch.expiryDate);
                    return (
                        <button
                            key={batch.id}
                            disabled={expired || batch.quantity === 0}
                            onClick={() => !expired && onSelect(batch)}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors text-left border-t border-border first:border-t-0',
                                expired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            )}
                        >
                            <div>
                                <span className="font-mono text-text-1 text-xs">{batch.batchNo}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn('text-xs', days < 0 ? 'text-critical' : days <= 30 ? 'text-critical' : days <= 90 ? 'text-warning' : 'text-text-3')}>
                                        Exp: {formatDate(batch.expiryDate)}
                                        {days < 0 ? ' ❌' : days <= 30 ? ' ⚠️' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-2">Qty: <span className="text-text-1 font-medium">{batch.quantity}</span></p>
                                <p className="text-xs text-text-3 font-mono">MRP: {formatINR(batch.mrp)}</p>
                            </div>
                            <BatchStatusBadge status={batch.status} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// PaymentModal
// ──────────────────────────────────────────────
function PaymentModal({ totals, onConfirm, onClose }: {
    totals: ReturnType<typeof usePosStore.getState['computedTotal']>;
    onConfirm: (method: string) => void;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
    const [cashAmt, setCashAmt] = useState('');
    const change = parseFloat(cashAmt || '0') - totals.grand;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h3 className="font-display font-semibold text-text-1">Complete Payment</h3>
                        <p className="text-sm text-text-2">Total: <span className="text-text-1 font-bold text-lg">{formatINR(totals.grand)}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-text-3 hover:text-text-1 hover:bg-surface-2 rounded-md">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Payment tabs */}
                <div className="flex border-b border-border">
                    {(['Cash', 'UPI', 'Card', 'Split'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                'flex-1 py-2.5 text-sm font-medium transition-colors',
                                tab === t ? 'text-primary border-b-2 border-primary' : 'text-text-3 hover:text-text-2'
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {tab === 'Cash' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-text-2 mb-1.5 block">Amount Tendered (₹)</label>
                                <input
                                    type="number"
                                    value={cashAmt}
                                    onChange={e => setCashAmt(e.target.value)}
                                    placeholder={String(totals.grand)}
                                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-3 text-xl text-text-1 font-bold focus:border-primary outline-none font-mono"
                                    autoFocus
                                />
                            </div>
                            {cashAmt && change >= 0 && (
                                <div className="flex justify-between bg-success/10 border border-success/20 rounded-lg px-4 py-3">
                                    <span className="text-success font-medium">Change</span>
                                    <span className="text-success font-bold text-lg font-mono">{formatINR(change)}</span>
                                </div>
                            )}
                            {cashAmt && change < 0 && (
                                <div className="flex justify-between bg-critical/10 border border-critical/20 rounded-lg px-4 py-3">
                                    <span className="text-critical font-medium">Balance Due</span>
                                    <span className="text-critical font-bold text-lg font-mono">{formatINR(Math.abs(change))}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {tab === 'UPI' && (
                        <div className="space-y-4">
                            <div className="bg-surface-2 rounded-xl p-6 flex items-center justify-center">
                                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                                    <div className="text-center text-black text-xs p-2">
                                        <div className="w-24 h-24 bg-gray-200 rounded"></div>
                                        <p className="mt-1 text-xs">QR Code</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-2 mb-1 block">UPI Reference ID</label>
                                <input placeholder="Enter UPI reference" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none font-mono" />
                            </div>
                        </div>
                    )}
                    {tab === 'Card' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-text-2 mb-1 block">Card Type</label>
                                <div className="flex gap-2">
                                    {['Visa', 'Mastercard', 'RuPay'].map(c => (
                                        <button key={c} className="flex-1 py-2 rounded-lg border border-border hover:border-primary/50 text-sm text-text-2 hover:text-text-1 transition-colors">{c}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-2 mb-1 block">Last 4 digits</label>
                                <input maxLength={4} placeholder="XXXX" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none font-mono tracking-widest" />
                            </div>
                        </div>
                    )}
                    {tab === 'Split' && (
                        <div className="space-y-2">
                            <p className="text-xs text-text-3">Add multiple payment methods to split the bill.</p>
                            {['Cash', 'UPI'].map(m => (
                                <div key={m} className="flex items-center gap-3">
                                    <span className="text-sm text-text-2 w-16">{m}</span>
                                    <input placeholder="₹ Amount" className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none font-mono" />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => onConfirm(tab)}
                        className="w-full mt-5 py-3 bg-primary hover:bg-primary-dim text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Confirm & Print Invoice
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Main POS Page
// ──────────────────────────────────────────────
export function POSPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [blockedBatch, setBlockedBatch] = useState<{ batch: Batch; medicine: Medicine } | null>(null);
    const [prescriptionMedicine, setPrescriptionMedicine] = useState<Medicine | null>(null);
    const [showBatchSelector, setShowBatchSelector] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const { cart, addItem, removeItem, updateQty, clearCart, computedTotal, setPaymentOpen, paymentOpen, activePatient, setActivePatient, applyDiscount, discount, linkPrescription } = usePosStore();
    const totals = computedTotal();

    // Auto-focus search on page load & F2
    useEffect(() => {
        searchRef.current?.focus();
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
            if (e.key === 'F4') {
                e.preventDefault();
                const store = usePosStore.getState();
                const unlinkedH = store.cart.some(item => (item.medicine.scheduleType === 'H' || item.medicine.scheduleType === 'H1') && !item.prescriptionId);
                if (store.cart.length > 0 && !unlinkedH) setPaymentOpen(true);
                else if (unlinkedH) toast.error('Schedule H drugs require prescription before checkout');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                usePosStore.getState().undoLastAction();
                toast.info('Last action undone');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart.length, setPaymentOpen]);

    const filteredMedicines = searchQuery.length > 0
        ? mockMedicines.filter(m =>
            m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            searchQuery.length >= 8 // barcode detection
        ).slice(0, 10)
        : [];

    const handleMedicineSelect = (medicine: Medicine) => {
        setSelectedMedicine(medicine);
        setShowBatchSelector(true);
        setSearchQuery('');
    };

    const handleBatchSelect = (batch: Batch) => {
        if (!selectedMedicine) return;
        if (batch.status === 'Expired' || batch.status === 'Blocked' || isBatchExpired(batch)) {
            setBlockedBatch({ batch, medicine: selectedMedicine });
            setShowBatchSelector(false);
            return;
        }
        addItem(selectedMedicine, batch, 1);
        if (selectedMedicine.scheduleType === 'H' || selectedMedicine.scheduleType === 'H1') {
            setPrescriptionMedicine(selectedMedicine);
        }
        setShowBatchSelector(false);
        setSelectedMedicine(null);
        toast.success(`${selectedMedicine.brandName} added to cart`);
        setTimeout(() => searchRef.current?.focus(), 100);
    };

    const handlePrescriptionSubmit = (data: PrescriptionFormData) => {
        if (!prescriptionMedicine) return;
        const prescription: Prescription = {
            id: `RX-${Date.now()}`,
            customerId: activePatient?.id ?? 'walk-in',
            customerName: activePatient?.name ?? 'Walk-in',
            doctorName: data.doctorName,
            mciRegNo: data.mciRegNo,
            prescriptionDate: data.prescriptionDate,
            imageUrl: data.imageUrl,
            medicines: [prescriptionMedicine.brandName],
            status: 'Active',
            createdAt: new Date().toISOString(),
        };
        linkPrescription(prescriptionMedicine.id, prescription);
        setPrescriptionMedicine(null);
        toast.success('Prescription linked successfully');
    };

    const handlePaymentConfirm = (method: string) => {
        clearCart();
        setPaymentOpen(false);
        toast.success(`Invoice printed! Payment received via ${method}`, { duration: 4000 });
    };

    const hasUnlinkedPrescription = cart.some(item =>
        (item.medicine.scheduleType === 'H' || item.medicine.scheduleType === 'H1') && !item.prescriptionId
    );

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-bg overflow-hidden">
            {/* Left Panel: Medicine Search */}
            <div className="flex-[1.4] flex flex-col border-r border-border overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-border flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowBatchSelector(false);
                            }}
                            placeholder="Search medicine / barcode... (F2 to focus)"
                            className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none transition-colors"
                            autoFocus
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Medicine Results */}
                <div className="flex-1 overflow-y-auto p-3 relative">
                    {/* Batch selector overlay */}
                    {showBatchSelector && selectedMedicine && (
                        <div className="relative">
                            <BatchSelector
                                medicine={selectedMedicine}
                                onSelect={handleBatchSelect}
                                onClose={() => { setShowBatchSelector(false); setSelectedMedicine(null); }}
                            />
                        </div>
                    )}

                    {!showBatchSelector && (
                        <AnimatePresence>
                            {filteredMedicines.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredMedicines.map((med, i) => {
                                        const qtyInStock = mockBatches
                                            .filter(b => b.medicineId === med.id && b.status === 'Available')
                                            .reduce((s, b) => s + b.quantity, 0);
                                        const inCart = cart.find(c => c.medicine.id === med.id);
                                        return (
                                            <motion.button
                                                key={med.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                onClick={() => handleMedicineSelect(med)}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-surface-2 transition-colors border border-transparent hover:border-border text-left"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-text-1 truncate">{med.brandName}</p>
                                                        <ScheduleBadge schedule={med.scheduleType} />
                                                        {inCart && <Badge variant="info" size="sm">In cart</Badge>}
                                                    </div>
                                                    <p className="text-xs text-text-3 truncate">{med.genericName} · {med.packSize}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-text-1 font-mono">
                                                        {formatINR(mockBatches.find(b => b.medicineId === med.id && b.status === 'Available')?.mrp ?? 0)}
                                                    </p>
                                                    <p className={cn('text-xs', qtyInStock === 0 ? 'text-critical' : qtyInStock <= med.reorderPoint ? 'text-warning' : 'text-success')}>
                                                        {qtyInStock === 0 ? 'Out of stock' : `${qtyInStock} units`}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            ) : searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Search className="w-10 h-10 text-text-3 mb-3" />
                                    <p className="text-text-2 font-medium">No medicines found</p>
                                    <p className="text-text-3 text-sm mt-1">Try a different name or barcode</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ShoppingCart className="w-10 h-10 text-text-3 mb-3" />
                                    <p className="text-text-2 font-medium">Start searching</p>
                                    <p className="text-text-3 text-sm mt-1">Type medicine name, generic name, or scan barcode</p>
                                    <div className="flex gap-4 mt-6 text-xs text-text-3">
                                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-border">F2</kbd> Focus</span>
                                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-border">F4</kbd> Payment</span>
                                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-border">Ctrl+Z</kbd> Undo</span>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Right Panel: Cart */}
            <div className="flex-1 flex flex-col bg-surface overflow-hidden">
                {/* Patient selector */}
                <div className="px-4 py-3 border-b border-border flex-shrink-0">
                    <label className="text-xs text-text-3 block mb-1.5">Patient / Customer</label>
                    <select
                        value={activePatient?.id ?? ''}
                        onChange={e => {
                            const c = mockCustomers.find(c => c.id === e.target.value);
                            setActivePatient(c ?? null);
                        }}
                        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none"
                    >
                        <option value="">Walk-in Customer</option>
                        {mockCustomers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                        ))}
                    </select>
                    {activePatient && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                            {activePatient.tags.map(tag => (
                                <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                            ))}
                            <span className="text-xs text-text-3 ml-auto">{activePatient.loyaltyPoints} pts</span>
                        </div>
                    )}
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <ShoppingCart className="w-10 h-10 text-text-3 mb-3" />
                            <p className="text-text-3 text-sm">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <motion.div
                                key={item.batch.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    'bg-surface-2 rounded-lg p-3 border',
                                    item.prescriptionId ? 'border-success/20' : item.medicine.scheduleType !== 'OTC' ? 'border-warning/30' : 'border-border'
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-text-1 truncate">{item.medicine.brandName}</p>
                                            <ScheduleBadge schedule={item.medicine.scheduleType} />
                                            {item.prescriptionId ? (
                                                <Badge variant="success" size="sm">✓ Rx</Badge>
                                            ) : item.medicine.scheduleType !== 'OTC' ? (
                                                <button
                                                    onClick={() => setPrescriptionMedicine(item.medicine)}
                                                    className="text-xs text-warning animate-pulse hover:underline"
                                                >
                                                    ⚠ Add Rx
                                                </button>
                                            ) : null}
                                        </div>
                                        <p className="text-xs text-text-3 font-mono">{item.batch.batchNo} · Exp {formatDate(item.batch.expiryDate)}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.batch.id)} className="p-1 text-text-3 hover:text-critical hover:bg-critical/10 rounded transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 bg-surface rounded-lg overflow-hidden border border-border">
                                        <button onClick={() => updateQty(item.batch.id, item.quantity - 1)} className="p-1.5 hover:bg-surface-2 transition-colors"><Minus className="w-3 h-3" /></button>
                                        <span className="text-sm font-mono text-text-1 px-2 min-w-[24px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.batch.id, item.quantity + 1)} className="p-1.5 hover:bg-surface-2 transition-colors"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-text-1 font-mono">{formatINR(item.subtotal)}</p>
                                        <p className="text-xs text-text-3">{formatINR(item.unitPrice)}/unit</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                    <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
                        {/* Discount */}
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg border border-border overflow-hidden flex-shrink-0">
                                <button
                                    onClick={() => applyDiscount({ ...discount, type: 'flat' })}
                                    className={cn('px-2.5 py-1 text-xs transition-colors', discount.type === 'flat' ? 'bg-primary text-white' : 'text-text-3 hover:bg-surface-2')}
                                >₹</button>
                                <button
                                    onClick={() => applyDiscount({ ...discount, type: 'percent' })}
                                    className={cn('px-2.5 py-1 text-xs transition-colors', discount.type === 'percent' ? 'bg-primary text-white' : 'text-text-3 hover:bg-surface-2')}
                                >%</button>
                            </div>
                            <input
                                type="number"
                                min={0}
                                value={discount.value || ''}
                                onChange={e => applyDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                                placeholder="Discount"
                                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-text-1 focus:border-primary outline-none font-mono"
                            />
                        </div>

                        {/* GST breakdown */}
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-text-2">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatINR(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-text-2">
                                <span>GST (CGST+SGST)</span>
                                <span className="font-mono">{formatINR(totals.gst)}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div className="flex justify-between text-success">
                                    <span>Discount</span>
                                    <span className="font-mono">-{formatINR(totals.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-text-1 pt-2 border-t border-border font-display">
                                <span>Total</span>
                                <span className="font-mono">{formatINR(totals.grand)}</span>
                            </div>
                        </div>

                        {hasUnlinkedPrescription && (
                            <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 text-xs text-warning">
                                ⚠ Schedule H drugs require prescription before checkout
                            </div>
                        )}

                        <button
                            onClick={() => setPaymentOpen(true)}
                            disabled={cart.length === 0 || hasUnlinkedPrescription}
                            className="w-full py-3 bg-primary hover:bg-primary-dim text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CreditCard className="w-4 h-4" />
                            Complete Payment (F4)
                        </button>

                        <button onClick={clearCart} className="w-full py-2 text-xs text-text-3 hover:text-critical transition-colors">
                            Clear cart
                        </button>
                    </div>
                )}
            </div>

            {/* Overlays */}
            {blockedBatch && (
                <ExpiredBatchBlocker
                    batch={blockedBatch.batch}
                    medicine={blockedBatch.medicine}
                    onClose={() => setBlockedBatch(null)}
                />
            )}
            {prescriptionMedicine && (
                <PrescriptionDrawer
                    medicine={prescriptionMedicine}
                    onSubmit={handlePrescriptionSubmit}
                    onClose={() => setPrescriptionMedicine(null)}
                />
            )}
            {paymentOpen && (
                <PaymentModal
                    totals={totals}
                    onConfirm={handlePaymentConfirm}
                    onClose={() => setPaymentOpen(false)}
                />
            )}
        </div>
    );
}
