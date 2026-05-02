import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Batch, Medicine, Customer } from '@/types';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { ScheduleBadge } from '@/components/common/Badge';
import { usePosStore } from '@/stores/posStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useBranchInventoryStore } from '@/stores/branchInventoryStore';
import { apiClient } from '@/api/client';
import { useLocation, useNavigate } from 'react-router-dom';

type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Split';

function BatchSelector({
  medicine,
  batches,
  onSelect,
  onClose,
}: {
  medicine: Medicine;
  batches: Batch[];
  onSelect: (batch: Batch) => void;
  onClose: () => void;
}) {
  const candidates = useMemo(
    () =>
      batches
        .filter((b) => b.medicineId === medicine.id && b.status === 'Available' && b.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
    [batches, medicine.id]
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md h-full bg-surface border-l border-border shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-text-1">{medicine.brandName}</p>
            <p className="text-xs text-text-3">Select available batch</p>
          </div>
          <button onClick={onClose} className="text-text-3 hover:text-text-2"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {candidates.map((batch) => (
            <button
              key={batch.id}
              onClick={() => onSelect(batch)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-2 transition-colors text-left border-b border-border"
            >
              <div>
                <p className="font-mono text-text-1 text-xs">{batch.batchNo}</p>
                <p className="text-xs text-text-3">Exp {formatDate(batch.expiryDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-2">Qty <span className="font-medium text-text-1">{batch.quantity}</span></p>
                <p className="text-xs font-mono text-text-3">MRP {formatINR(batch.mrp)}</p>
              </div>
            </button>
          ))}
          {candidates.length === 0 && <p className="px-4 py-6 text-sm text-text-3">No sellable batch available</p>}
        </div>
      </motion.div>
    </div>
  );
}

function PaymentModal({
  total,
  onConfirm,
  onClose,
}: {
  total: number;
  onConfirm: (method: PaymentMethod) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('Cash');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-5"
      >
        <h3 className="text-lg font-semibold text-text-1">Complete Payment</h3>
        <p className="text-sm text-text-2 mt-1">Total: <span className="font-mono text-text-1">{formatINR(total)}</span></p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {(['Cash', 'UPI', 'Card', 'Split'] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm',
                method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-2'
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="rounded border border-border px-4 py-2 text-sm text-text-2">Cancel</button>
          <button onClick={() => onConfirm(method)} className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}

export function POSPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTenantId = useTenantStore((state) => state.currentTenantId);
  const branch = useBranchInventoryStore((state) => state.branches[currentTenantId]);

  const [query, setQuery] = useState('');
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [saleNotes, setSaleNotes] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    cart,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    computedTotal,
    paymentOpen,
    setPaymentOpen,
    activePatient,
    setActivePatient,
    discount,
    applyDiscount,
  } = usePosStore();

  const totals = computedTotal();

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const state = (location.state || {}) as { customerId?: string; customerName?: string; source?: string };
    if (!state.customerId || !branch) return;

    const customer = branch.customers.find((c) => c.id === state.customerId);
    if (customer) {
      setActivePatient(customer);
      setPatientQuery(customer.name);
      toast.success(`Customer selected: ${customer.name}`);
    } else if (state.customerName) {
      const fallbackCustomer = {
        id: state.customerId,
        name: state.customerName,
        phone: '',
        email: '',
        address: '',
        totalSpent: 0,
        totalVisits: 0,
        lastVisitDate: new Date().toISOString().split('T')[0],
        tags: [],
        loyaltyPoints: 0,
        tenantId: currentTenantId,
        createdAt: new Date().toISOString().split('T')[0],
      } as Customer;

      setActivePatient(fallbackCustomer);
      setPatientQuery(state.customerName);
    }

    // Clear navigation state so it does not re-run on refresh.
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, branch, setActivePatient, navigate, currentTenantId]);

  const filteredMedicines = useMemo(() => {
    if (!branch) return [];

    const q = query.trim().toLowerCase();
    const stockedMedicines = branch.medicines
      .map((medicine) => {
        const availableQty = branch.batches
          .filter((batch) => batch.medicineId === medicine.id && batch.status === 'Available')
          .reduce((sum, batch) => sum + batch.quantity, 0);

        return { medicine, availableQty };
      })
      .filter(({ availableQty }) => availableQty > 0)
      .sort((a, b) => b.availableQty - a.availableQty)
      .map(({ medicine }) => medicine);

    if (!q) {
      return stockedMedicines.slice(0, 12);
    }

    return stockedMedicines
      .filter((medicine) =>
        medicine.brandName.toLowerCase().includes(q) ||
        medicine.genericName.toLowerCase().includes(q) ||
        query.length >= 8
      )
      .slice(0, 12);
  }, [branch, query]);

  const filteredCustomers = useMemo(() => {
    if (!branch) return [];
    const q = patientQuery.trim().toLowerCase();
    if (!q) return branch.customers;
    return branch.customers.filter((customer) =>
      customer.name.toLowerCase().includes(q) ||
      customer.phone.toLowerCase().includes(q) ||
      (customer.email || '').toLowerCase().includes(q)
    );
  }, [branch, patientQuery]);

  const hasPrescriptionGap = cart.some(
    (item) => (item.medicine.scheduleType === 'H' || item.medicine.scheduleType === 'H1') && !item.prescriptionId
  );

  const selectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowBatchSelector(true);
  };

  const selectBatch = (batch: Batch) => {
    if (!selectedMedicine) return;
    addItem(selectedMedicine, batch, 1);
    setShowBatchSelector(false);
    setSelectedMedicine(null);
    setQuery('');
    toast.success(`${selectedMedicine.brandName} added to cart`);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleQtyChange = (batchId: string, nextQty: number) => {
    const inStock = branch?.batches.find((b) => b.id === batchId)?.quantity || 0;
    if (nextQty > inStock) {
      toast.error(`Only ${inStock} units available`);
      return;
    }
    updateQty(batchId, nextQty);
  };

  const confirmPayment = async (method: PaymentMethod) => {
    if (hasPrescriptionGap) {
      toast.warning('Schedule H/H1 items are being billed without linked prescription (demo mode)');
    }

    try {
      await apiClient.createPOSTransaction({
        branchId: currentTenantId,
        items: cart.map((item) => ({ batchId: item.batch.id, quantity: item.quantity })),
        customerId: activePatient?.id,
        prescriptionId: cart.find((item) => item.prescriptionId)?.prescriptionId,
        discountAmount: totals.discount,
        paymentMethod: method === 'Cash' ? 'CASH' : method === 'UPI' ? 'UPI' : method === 'Card' ? 'CARD' : 'SPLIT',
        notes: saleNotes.trim() || undefined,
      });

      await useBranchInventoryStore.getState().initializeBranches([currentTenantId]);
      clearCart();
      setPaymentOpen(false);
      setSaleNotes('');
      toast.success(`Payment completed via ${method}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete sale');
      return;
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-bg overflow-hidden">
      <div className="flex-[1.4] flex flex-col border-r border-border overflow-hidden">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowBatchSelector(false);
              }}
              placeholder="Search medicine name, generic, or barcode (e.g. Paracetamol 500 / Crocin)"
              className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 relative">
          {showBatchSelector && selectedMedicine && (
            <BatchSelector
              medicine={selectedMedicine}
              batches={branch?.batches || []}
              onSelect={selectBatch}
              onClose={() => {
                setShowBatchSelector(false);
                setSelectedMedicine(null);
              }}
            />
          )}

          <AnimatePresence>
            {filteredMedicines.length > 0 ? (
              <div className="space-y-1">
                {filteredMedicines.map((medicine) => {
                  const stock = (branch?.batches || [])
                    .filter((b) => b.medicineId === medicine.id && b.status === 'Available')
                    .reduce((sum, b) => sum + b.quantity, 0);
                  const mrp = (branch?.batches || []).find((b) => b.medicineId === medicine.id && b.status === 'Available')?.mrp || 0;

                  return (
                    <button
                      key={medicine.id}
                      onClick={() => selectMedicine(medicine)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border"
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-1">{medicine.brandName}</p>
                          <ScheduleBadge schedule={medicine.scheduleType} />
                        </div>
                        <p className="text-xs text-text-3">{medicine.genericName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-text-1">{formatINR(mrp)}</p>
                        <p className={cn('text-xs', stock <= medicine.reorderPoint ? 'text-warning' : 'text-success')}>{stock} units</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingCart className="w-10 h-10 text-text-3 mb-3" />
                <p className="text-text-2">Browse current branch medicines or search by name/barcode</p>
                <p className="text-text-3 text-xs mt-1">Only medicines with available stock are shown here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <label className="text-xs text-text-3 block mb-1.5">Patient / Customer</label>
          {activePatient && (
            <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <span className="truncate font-medium">Selected: {activePatient.name}</span>
            </div>
          )}
          <input
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            placeholder="Search customer by name, phone, or email (e.g. Anjali, 98..., patient@demo.com)"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 mb-2"
          />
          <select
            value={activePatient?.id || ''}
            onChange={(e) => {
              const customer = (branch?.customers || []).find((c) => c.id === e.target.value);
              setActivePatient(customer || null);
            }}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1"
          >
            <option value="">Walk-in Customer</option>
            {filteredCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name} — {customer.phone}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-10 h-10 text-text-3 mb-3" />
              <p className="text-text-3 text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.batch.id} className="bg-surface-2 rounded-lg p-3 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-1">{item.medicine.brandName}</p>
                    <p className="text-xs text-text-3 font-mono">{item.batch.batchNo} · Exp {formatDate(item.batch.expiryDate)}</p>
                  </div>
                  <button onClick={() => removeItem(item.batch.id)} className="p-1 rounded text-text-3 hover:text-critical">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-surface rounded-lg border border-border overflow-hidden">
                    <button onClick={() => handleQtyChange(item.batch.id, item.quantity - 1)} className="p-1.5 hover:bg-surface-2"><Minus className="w-3 h-3" /></button>
                    <span className="px-2 font-mono text-sm">{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item.batch.id, item.quantity + 1)} className="p-1.5 hover:bg-surface-2"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-text-1">{formatINR(item.subtotal)}</p>
                    <p className="text-xs text-text-3">{formatINR(item.unitPrice)}/unit</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => applyDiscount({ ...discount, type: 'flat' })}
                  className={cn('px-2.5 py-1 text-xs', discount.type === 'flat' ? 'bg-primary text-white' : 'text-text-3')}
                >₹</button>
                <button
                  onClick={() => applyDiscount({ ...discount, type: 'percent' })}
                  className={cn('px-2.5 py-1 text-xs', discount.type === 'percent' ? 'bg-primary text-white' : 'text-text-3')}
                >%</button>
              </div>
              <input
                type="number"
                min={0}
                value={discount.value || ''}
                onChange={(e) => applyDiscount({ ...discount, value: Number(e.target.value || 0) })}
                placeholder="Enter flat amount or % discount (e.g. 50 or 10)"
                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-text-1"
              />
            </div>

            <div>
              <label className="text-xs text-text-3 block mb-1.5">Sale Notes</label>
              <input
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Optional note for the bill (e.g. home delivery, corporate account, GST note)"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1"
              />
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-text-2"><span>Subtotal</span><span className="font-mono">{formatINR(totals.subtotal)}</span></div>
              <div className="flex justify-between text-text-2"><span>GST</span><span className="font-mono">{formatINR(totals.gst)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span className="font-mono">-{formatINR(totals.discount)}</span></div>}
              <div className="flex justify-between text-lg font-bold text-text-1 border-t border-border pt-2"><span>Total</span><span className="font-mono">{formatINR(totals.grand)}</span></div>
            </div>

            {hasPrescriptionGap && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 text-xs text-warning">
                Schedule H/H1 items require prescription before checkout
              </div>
            )}

            <button
              onClick={() => setPaymentOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary-dim text-white rounded-lg font-semibold"
            >
              <span className="inline-flex items-center gap-2"><CreditCard className="w-4 h-4" /> Complete Payment</span>
            </button>
            <button onClick={clearCart} className="w-full py-2 text-xs text-text-3 hover:text-critical">Clear cart</button>
          </div>
        )}
      </div>

      {paymentOpen && <PaymentModal total={totals.grand} onConfirm={confirmPayment} onClose={() => setPaymentOpen(false)} />}
    </div>
  );
}
