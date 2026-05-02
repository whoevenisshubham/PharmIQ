import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { OCRUploader } from '@/components/ocr/OCRUploader';
import { apiClient } from '@/api/client';
import { useTenantStore } from '@/stores/tenantStore';

type SupplierOption = {
  id: string;
  name: string;
};

type ExtractedMedicine = {
  name: string;
  composition?: string;
  quantity: number;
  unit_rate: number;
  hsn_code?: string;
  batch_number?: string;
  expiry_date?: string;
};

export function OCRProcurementPage() {
  const currentBranchId = useTenantStore((state) => state.currentTenantId);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const [isCreatingBatches, setIsCreatingBatches] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      setIsLoadingSuppliers(true);
      try {
        const data = await apiClient.getSuppliers();
        const list: SupplierOption[] = data.map((s: any) => ({ id: s.id, name: s.name }));
        setSuppliers(list);
        if (list.length > 0) {
          setSelectedSupplierId(list[0].id);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to load suppliers');
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    void loadSuppliers();
  }, []);

  const hasExtractedData = useMemo(() => extractedMedicines.length > 0, [extractedMedicines]);

  const createSupplier = async () => {
    if (!newSupplierName.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    setIsCreatingSupplier(true);
    try {
      const created = await apiClient.createSupplier({
        name: newSupplierName.trim(),
        phone: newSupplierPhone || undefined,
        email: newSupplierEmail || undefined,
      });

      const createdOption = { id: created.id, name: created.name };
      setSuppliers((prev) => [...prev, createdOption]);
      setSelectedSupplierId(created.id);
      setNewSupplierName('');
      setNewSupplierPhone('');
      setNewSupplierEmail('');
      setShowAddSupplierForm(false);
      toast.success('Supplier created');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create supplier');
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  const handleOcrSuccess = (invoice: any, extractedData: any) => {
    setInvoiceId(invoice?.id ?? null);
    setInvoiceNumber(invoice?.invoiceNumber ?? '');

    const meds: ExtractedMedicine[] = Array.isArray(extractedData?.medicines)
      ? extractedData.medicines.map((m: any) => ({
          name: String(m.name ?? '').trim(),
          composition: m.composition ? String(m.composition) : undefined,
          quantity: Number(m.quantity ?? 0),
          unit_rate: Number(m.unit_rate ?? 0),
          hsn_code: m.hsn_code ? String(m.hsn_code) : undefined,
          batch_number: m.batch_number ? String(m.batch_number) : undefined,
          expiry_date: m.expiry_date ? String(m.expiry_date) : undefined,
        }))
      : [];

    setExtractedMedicines(meds.filter((m) => m.name && m.quantity > 0 && m.unit_rate > 0));
  };

  const updateMedicine = (index: number, patch: Partial<ExtractedMedicine>) => {
    setExtractedMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const removeMedicine = (index: number) => {
    setExtractedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const createBatches = async () => {
    if (!invoiceId) {
      toast.error('Process an invoice first');
      return;
    }

    if (extractedMedicines.length === 0) {
      toast.error('No medicine rows available to create batches');
      return;
    }

    const invalid = extractedMedicines.some((m) => !m.name || m.quantity <= 0 || m.unit_rate <= 0);
    if (invalid) {
      toast.error('Fix invalid rows before creating batches');
      return;
    }

    setIsCreatingBatches(true);
    try {
      const response = await apiClient.createBatchesFromInvoice(invoiceId, extractedMedicines, currentBranchId);
      toast.success(response.message || 'Batches created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create batches');
    } finally {
      setIsCreatingBatches(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-1">OCR Procurement</h1>
        <p className="text-sm text-text-2 mt-1">
          Extract supplier invoice data and convert it into stock batches.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-text-2">Supplier</label>
            <button
              type="button"
              onClick={() => setShowAddSupplierForm((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-2 hover:bg-surface-2"
            >
              <Plus className="h-3.5 w-3.5" /> {showAddSupplierForm ? 'Hide Add Supplier' : 'Add Supplier'}
            </button>
          </div>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full max-w-md rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
            disabled={isLoadingSuppliers}
          >
            {isLoadingSuppliers && <option>Loading suppliers...</option>}
            {!isLoadingSuppliers && suppliers.length === 0 && <option value="">No suppliers found</option>}
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {(suppliers.length === 0 || showAddSupplierForm) && !isLoadingSuppliers && (
          <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-3">
            <p className="text-sm text-text-2">
              {suppliers.length === 0
                ? 'No suppliers found for this tenant. Add one to continue OCR procurement.'
                : 'Create another supplier and select it for this OCR invoice.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Supplier name"
                className="rounded border border-border bg-surface px-2 py-2 text-sm"
              />
              <input
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="rounded border border-border bg-surface px-2 py-2 text-sm"
              />
              <input
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                placeholder="Email (optional)"
                className="rounded border border-border bg-surface px-2 py-2 text-sm"
              />
            </div>
            <button
              onClick={createSupplier}
              disabled={isCreatingSupplier}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isCreatingSupplier ? 'Creating...' : 'Create Supplier'}
            </button>
          </div>
        )}

        {selectedSupplierId ? (
          <OCRUploader supplierId={selectedSupplierId} onSuccess={handleOcrSuccess} />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            Select a supplier first to process OCR invoice data.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-1">Extracted Medicines</h2>
            <p className="text-xs text-text-3">
              Invoice: {invoiceNumber || 'Not processed yet'}
            </p>
          </div>
          <button
            onClick={createBatches}
            disabled={!hasExtractedData || !invoiceId || isCreatingBatches}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingBatches ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Batches
              </span>
            ) : (
              'Create Batches from Invoice'
            )}
          </button>
        </div>

        {!hasExtractedData ? (
          <div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-blue-800">
            <CheckCircle2 className="h-4 w-4" />
            Process OCR text to review line items here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/40">
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-left">Composition</th>
                  <th className="px-3 py-2 text-left">Batch</th>
                  <th className="px-3 py-2 text-left">Expiry</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Unit Rate</th>
                  <th className="px-3 py-2 text-left">HSN</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {extractedMedicines.map((med, index) => (
                  <tr key={`${med.name}-${index}`} className="border-b border-border/60">
                    <td className="px-3 py-2">
                      <input
                        value={med.name}
                        onChange={(e) => updateMedicine(index, { name: e.target.value })}
                        className="w-44 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={med.composition ?? ''}
                        onChange={(e) => updateMedicine(index, { composition: e.target.value })}
                        className="w-44 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={med.batch_number ?? ''}
                        onChange={(e) => updateMedicine(index, { batch_number: e.target.value })}
                        className="w-32 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={med.expiry_date ?? ''}
                        onChange={(e) => updateMedicine(index, { expiry_date: e.target.value })}
                        className="w-36 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        value={med.quantity}
                        onChange={(e) => updateMedicine(index, { quantity: Number(e.target.value || 0) })}
                        className="w-20 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={med.unit_rate}
                        onChange={(e) => updateMedicine(index, { unit_rate: Number(e.target.value || 0) })}
                        className="w-24 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={med.hsn_code ?? ''}
                        onChange={(e) => updateMedicine(index, { hsn_code: e.target.value })}
                        className="w-24 rounded border border-border bg-surface-2 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeMedicine(index)}
                        className="rounded border border-border px-2 py-1 text-xs text-text-2 hover:bg-surface-2"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
