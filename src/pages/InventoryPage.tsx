import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Plus, X, Ban, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Batch, Medicine } from '@/types';
import { getExpiryStatus, daysUntilExpiry } from '@/lib/fefo';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { BatchStatusBadge, ScheduleBadge } from '@/components/common/Badge';
import { useTenantStore } from '@/stores/tenantStore';
import { useBranchInventoryStore } from '@/stores/branchInventoryStore';

type FlatInventoryRow = {
  medicine: Medicine;
  batch: Batch;
  supplierName: string;
};

export function InventoryPage() {
  const currentTenantId = useTenantStore((state) => state.currentTenantId);
  const branch = useBranchInventoryStore((state) => state.branches[currentTenantId]);
  const addMedicineWithBatch = useBranchInventoryStore((state) => state.addMedicineWithBatch);
  const importCsv = useBranchInventoryStore((state) => state.importCsv);
  const toggleBatchBlocked = useBranchInventoryStore((state) => state.toggleBatchBlocked);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<FlatInventoryRow | null>(null);
  const [showAddMedicine, setShowAddMedicine] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    category: 'General',
    packSize: '10x10',
    manufacturer: 'Local Pharma',
    hsnCode: '30049099',
    gstRate: 12 as 5 | 12 | 18,
    scheduleType: 'OTC' as Medicine['scheduleType'],
    reorderPoint: 20,
    batchNo: '',
    expiryDate: '',
    manufacturingDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    purchaseRate: 0,
    mrp: 0,
    supplierId: branch?.suppliers[0]?.id || 'S001',
  });

  const categories = useMemo(() => {
    return Array.from(new Set((branch?.medicines || []).map((m) => m.category)));
  }, [branch]);

  const rows = useMemo<FlatInventoryRow[]>(() => {
    if (!branch) return [];

    return branch.batches
      .map((batch) => {
        const medicine = branch.medicines.find((m) => m.id === batch.medicineId);
        if (!medicine) return null;

        const supplier = branch.suppliers.find((s) => s.id === batch.supplierId);
        return {
          medicine,
          batch,
          supplierName: supplier?.name || 'Unknown Supplier',
        };
      })
      .filter((r): r is FlatInventoryRow => Boolean(r))
      .filter((row) => {
        if (statusFilter === 'blocked' && row.batch.status !== 'Blocked') return false;
        if (statusFilter === 'low_stock' && row.batch.quantity > row.medicine.reorderPoint) return false;
        if (statusFilter === 'near_expiry') {
          const d = daysUntilExpiry(row.batch.expiryDate);
          if (d < 0 || d > 30) return false;
        }
        if (statusFilter === 'expired' && getExpiryStatus(row.batch.expiryDate) !== 'expired') return false;
        if (categoryFilter !== 'all' && row.medicine.category !== categoryFilter) return false;

        if (!query.trim()) return true;

        const q = query.toLowerCase();
        return (
          row.medicine.brandName.toLowerCase().includes(q) ||
          row.medicine.genericName.toLowerCase().includes(q) ||
          row.batch.batchNo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.batch.expiryDate).getTime() - new Date(b.batch.expiryDate).getTime());
  }, [branch, statusFilter, categoryFilter, query]);

  const onCsvPicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvText = await file.text();
      const result = await importCsv(currentTenantId, csvText);

      if (result.errors.length) {
        toast.warning('CSV imported with warnings', {
          description: `${result.medicinesCreated} medicines and ${result.batchesCreated} batches created. ${result.errors[0]}`,
        });
      } else {
        toast.success('CSV imported successfully', {
          description: `${result.medicinesCreated} medicines and ${result.batchesCreated} batches created`,
        });
      }
    } catch {
      toast.error('Unable to process CSV file');
    } finally {
      event.target.value = '';
    }
  };

  const createMedicine = async () => {
    if (!form.brandName.trim() || !form.genericName.trim() || !form.batchNo.trim()) {
      toast.error('Brand name, generic name and batch no are required');
      return;
    }
    if (form.quantity <= 0 || form.purchaseRate <= 0 || form.mrp <= 0) {
      toast.error('Quantity, purchase rate and MRP must be greater than 0');
      return;
    }

    try {
      await addMedicineWithBatch(currentTenantId, form);
      toast.success('Medicine added to inventory');
      setShowAddMedicine(false);
      setForm((prev) => ({
        ...prev,
        brandName: '',
        genericName: '',
        batchNo: '',
        quantity: 0,
        purchaseRate: 0,
        mrp: 0,
      }));
    } catch {
      toast.error('Unable to save medicine');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-1">Inventory</h1>
          <p className="text-sm text-text-2 mt-1">{rows.length} visible batches · {branch?.medicines.length || 0} medicines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 text-sm"
          >
            <Download className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => setShowAddMedicine(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        </div>
      </div>

      <input ref={fileInputRef} onChange={onCsvPicked} type="file" accept=".csv,text/csv" className="hidden" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by medicine, generic, batch"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-1"
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-1">
          <option value="all">All Status</option>
          <option value="expired">Expired</option>
          <option value="near_expiry">Near Expiry (30d)</option>
          <option value="low_stock">Low Stock</option>
          <option value="blocked">Blocked</option>
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-1">
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {(query || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <button
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="px-3 py-2 rounded-lg border border-border text-sm text-text-2 hover:text-text-1"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/40">
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Medicine</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Batch</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Expiry</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Pricing</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Schedule</th>
                <th className="px-4 py-2 text-left text-xs text-text-3 uppercase">Status</th>
                <th className="px-4 py-2 text-right text-xs text-text-3 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.batch.id} className="hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-text-1">{row.medicine.brandName}</p>
                    <p className="text-xs text-text-3">{row.medicine.genericName}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-mono text-xs text-text-2">{row.batch.batchNo}</p>
                    <p className="text-xs text-text-3">{row.supplierName}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className={cn('text-sm', getExpiryStatus(row.batch.expiryDate) === 'expired' ? 'text-critical' : 'text-text-1')}>
                      {formatDate(row.batch.expiryDate)}
                    </p>
                    <p className="text-xs text-text-3">{daysUntilExpiry(row.batch.expiryDate)}d</p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-text-1">{row.batch.quantity}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-mono text-xs text-text-2">CP {formatINR(row.batch.purchaseRate)}</p>
                    <p className="font-mono text-sm text-text-1">MRP {formatINR(row.batch.mrp)}</p>
                  </td>
                  <td className="px-4 py-2.5"><ScheduleBadge schedule={row.medicine.scheduleType} /></td>
                  <td className="px-4 py-2.5"><BatchStatusBadge status={row.batch.status} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setSelectedRow(row)} className="px-2 py-1 rounded border border-border text-xs text-text-2">View</button>
                      <button
                        onClick={async () => {
                          await toggleBatchBlocked(currentTenantId, row.batch.id);
                          toast.success(row.batch.status === 'Blocked' ? 'Batch unblocked' : 'Batch blocked');
                        }}
                        className="px-2 py-1 rounded border border-border text-xs text-warning"
                      >
                        {row.batch.status === 'Blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-text-3">No rows match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedRow && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedRow(null)}>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-96 h-full bg-surface border-l border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-1">Batch Details</h3>
                <button onClick={() => setSelectedRow(null)} className="p-1 rounded text-text-3 hover:text-text-1"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-text-3">Medicine</p>
                  <p className="text-text-1 font-medium">{selectedRow.medicine.brandName}</p>
                </div>
                <div>
                  <p className="text-text-3">Batch</p>
                  <p className="font-mono text-text-1">{selectedRow.batch.batchNo}</p>
                </div>
                <div>
                  <p className="text-text-3">Supplier</p>
                  <p className="text-text-1">{selectedRow.supplierName}</p>
                </div>
                <div>
                  <p className="text-text-3">Expiry</p>
                  <p className="text-text-1">{formatDate(selectedRow.batch.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-text-3">Quantity</p>
                  <p className="text-text-1">{selectedRow.batch.quantity}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddMedicine(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-1">Add Medicine + Batch</h3>
                <button onClick={() => setShowAddMedicine(false)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={form.brandName} onChange={(e) => setForm((p) => ({ ...p, brandName: e.target.value }))} placeholder="Brand name" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input value={form.genericName} onChange={(e) => setForm((p) => ({ ...p, genericName: e.target.value }))} placeholder="Generic name" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input value={form.manufacturer} onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))} placeholder="Manufacturer" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input value={form.packSize} onChange={(e) => setForm((p) => ({ ...p, packSize: e.target.value }))} placeholder="Pack size" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input value={form.hsnCode} onChange={(e) => setForm((p) => ({ ...p, hsnCode: e.target.value }))} placeholder="HSN" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <select value={form.scheduleType} onChange={(e) => setForm((p) => ({ ...p, scheduleType: e.target.value as Medicine['scheduleType'] }))} className="rounded border border-border bg-surface-2 px-3 py-2 text-sm">
                  <option value="OTC">OTC</option>
                  <option value="H">H</option>
                  <option value="H1">H1</option>
                  <option value="X">X</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input value={form.batchNo} onChange={(e) => setForm((p) => ({ ...p, batchNo: e.target.value }))} placeholder="Batch no" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input type="number" min={1} value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value || 0) }))} placeholder="Qty" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input type="number" min={0} value={form.purchaseRate} onChange={(e) => setForm((p) => ({ ...p, purchaseRate: Number(e.target.value || 0) }))} placeholder="Purchase rate" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
                <input type="number" min={0} value={form.mrp} onChange={(e) => setForm((p) => ({ ...p, mrp: Number(e.target.value || 0) }))} placeholder="MRP" className="rounded border border-border bg-surface-2 px-3 py-2 text-sm" />
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowAddMedicine(false)} className="rounded border border-border px-4 py-2 text-sm text-text-2">Cancel</button>
                <button onClick={createMedicine} className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">Save Medicine</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
