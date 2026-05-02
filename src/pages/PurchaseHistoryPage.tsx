import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ReceiptText, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR, formatDateTime, cn, formatDate } from '@/lib/utils';
import { apiClient } from '@/api/client';
import { useTenantStore } from '@/stores/tenantStore';

type TransactionItem = {
  batch: {
    batchNo: string;
    expiryDate: string;
    medicine: {
      name: string;
      generic?: string;
    };
  };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type TransactionRow = {
  id: string;
  transactionDate: string;
  totalAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'SPLIT';
  customer: { name: string } | null;
  user: { firstName: string; lastName: string; email?: string } | null;
  items: TransactionItem[];
};

const paymentLabel = (method: TransactionRow['paymentMethod']) => {
  if (method === 'CASH') return 'Cash';
  if (method === 'UPI') return 'UPI';
  if (method === 'CARD') return 'Card';
  if (method === 'CHEQUE') return 'Cheque';
  return 'Split';
};

export function PurchaseHistoryPage() {
  const currentBranchId = useTenantStore((state) => state.currentTenantId);
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | TransactionRow['paymentMethod']>('all');
  const [selected, setSelected] = useState<TransactionRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getPOSTransactions(undefined, undefined, currentBranchId);
        setRows(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentBranchId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (paymentFilter !== 'all' && row.paymentMethod !== paymentFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        (row.customer?.name || 'walk-in customer').toLowerCase().includes(q) ||
        paymentLabel(row.paymentMethod).toLowerCase().includes(q) ||
        row.items.some((item) => item.batch.medicine.name.toLowerCase().includes(q))
      );
    });
  }, [rows, query, paymentFilter]);

  const totalAmount = filtered.reduce((sum, row) => sum + row.totalAmount, 0);
  const todayCount = filtered.filter((row) => new Date(row.transactionDate).toDateString() === new Date().toDateString()).length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-1">Purchase History</h1>
        <p className="text-sm text-text-2 mt-1">Live billing history synced from the database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-3">Transactions</p>
          <p className="text-2xl font-bold text-text-1 mt-2">{loading ? '...' : filtered.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-3">Today</p>
          <p className="text-2xl font-bold text-text-1 mt-2">{loading ? '...' : todayCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-3">Gross Amount</p>
          <p className="text-2xl font-bold text-text-1 mt-2">{loading ? '...' : formatINR(totalAmount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice, customer, medicine, payment"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-1"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm">
          <Filter className="w-4 h-4 text-text-3" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-transparent text-text-1 outline-none"
          >
            <option value="all" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>All Payments</option>
            <option value="CASH" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Cash</option>
            <option value="UPI" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>UPI</option>
            <option value="CARD" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Card</option>
            <option value="CHEQUE" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Cheque</option>
            <option value="SPLIT" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>Split</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/50">
                {['Invoice No', 'Date', 'Customer', 'Amount', 'Payment', 'Created By'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-3">
                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading history...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-3">
                    No transactions found
                  </td>
                </tr>
              ) : filtered.map((row) => (
                <tr key={row.id} className="hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setSelected(row)}>
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{row.id.slice(0, 10).toUpperCase()}</td>
                  <td className="px-4 py-2.5 text-xs text-text-2">{formatDateTime(row.transactionDate)}</td>
                  <td className="px-4 py-2.5 text-text-1">{row.customer?.name || 'Walk-in Customer'}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-text-1">{formatINR(row.totalAmount)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      row.paymentMethod === 'CASH' ? 'bg-success/10 text-success' :
                        row.paymentMethod === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                    )}>
                      {paymentLabel(row.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-text-3">{row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/45" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg h-full bg-surface border-l border-border overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-1">Transaction Details</h3>
                  <p className="text-xs text-text-3 font-mono">{selected.id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Date" value={formatDateTime(selected.transactionDate)} />
                  <InfoCard label="Customer" value={selected.customer?.name || 'Walk-in Customer'} />
                  <InfoCard label="Payment" value={paymentLabel(selected.paymentMethod)} />
                  <InfoCard label="Amount" value={formatINR(selected.totalAmount)} />
                </div>

                <div className="rounded-xl border border-border bg-surface-2/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-text-3">Items</div>
                  <div className="divide-y divide-border">
                    {selected.items.map((item) => (
                      <div key={`${item.batch.batchNo}-${item.batch.medicine.name}`} className="px-4 py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-text-1">{item.batch.medicine.name}</p>
                          <p className="text-xs text-text-3 font-mono">{item.batch.batchNo} · Exp {formatDate(item.batch.expiryDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-1 font-mono">{item.quantity} x {formatINR(item.unitPrice)}</p>
                          <p className="text-xs text-text-3 font-mono">{formatINR(item.lineTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-3">
      <p className="text-xs text-text-3 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-text-1 font-medium break-words">{value}</p>
    </div>
  );
}
