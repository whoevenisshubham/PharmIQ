import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTenantStore } from '@/stores/tenantStore';
import { useBranchInventoryStore } from '@/stores/branchInventoryStore';

const STEPS = ['Initiated', 'In Transit', 'Received', 'Confirmed'];

export function TransferPage() {
  const tenants = useTenantStore((state) => state.tenants);
  const currentTenantId = useTenantStore((state) => state.currentTenantId);
  const branches = useBranchInventoryStore((state) => state.branches);
  const transferStock = useBranchInventoryStore((state) => state.transferStock);

  const [sourceTenant, setSourceTenant] = useState(currentTenantId || tenants[0]?.id || '');
  const [destTenant, setDestTenant] = useState(tenants.find((t) => t.id !== (currentTenantId || tenants[0]?.id))?.id || '');
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Record<string, number>>({});

  const sourceBranch = branches[sourceTenant];
  const destBranch = branches[destTenant];

  useEffect(() => {
    if (tenants.length === 0) return;

    const sourceValid = tenants.some((t) => t.id === sourceTenant);
    const resolvedSource = sourceValid ? sourceTenant : (currentTenantId || tenants[0].id);

    if (resolvedSource !== sourceTenant) {
      setSourceTenant(resolvedSource);
    }

    const destinationOptions = tenants.filter((t) => t.id !== resolvedSource);
    const destinationValid = destinationOptions.some((t) => t.id === destTenant);
    if (!destinationValid) {
      setDestTenant(destinationOptions[0]?.id || '');
    }
  }, [tenants, currentTenantId, sourceTenant, destTenant]);

  const sourceRows = useMemo(() => {
    if (!sourceBranch) return [];

    return sourceBranch.medicines
      .map((m) => {
        const qty = sourceBranch.batches
          .filter((b) => b.medicineId === m.id && b.status === 'Available')
          .reduce((sum, b) => sum + b.quantity, 0);
        return { medicine: m, qty };
      })
      .filter((r) => r.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 12);
  }, [sourceBranch]);

  const destinationQty = (medicineId: string): number => {
    if (!destBranch) return 0;
    return destBranch.batches
      .filter((b) => b.medicineId === medicineId && b.status === 'Available')
      .reduce((sum, b) => sum + b.quantity, 0);
  };

  const totalSelected = Object.values(lines).reduce((s, q) => s + (q || 0), 0);

  const resetSelection = () => {
    setLines({});
    setStep(0);
  };

  const proceed = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const payload = Object.entries(lines)
      .map(([medicineId, quantity]) => ({ medicineId, quantity: Math.floor(quantity || 0) }))
      .filter((l) => l.quantity > 0);

    const result = await transferStock(sourceTenant, destTenant, payload);
    if (!result.success) {
      toast.error(result.error || 'Transfer failed');
      return;
    }

    toast.success('Transfer completed', { description: `${result.moved} units transferred` });
    resetSelection();
  };

  const destinationOptions = tenants.filter((t) => t.id !== sourceTenant);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-1">Inter-Branch Transfer</h1>
        <p className="text-sm text-text-2 mt-1">Working transfer flow with branch-segregated stock and batches</p>
      </div>

      <div className="flex items-center gap-0 max-w-xl">
        {STEPS.map((label, index) => (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index < step ? 'bg-success text-white' : index === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-2 text-text-3'
                )}
              >
                {index < step ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <p className={cn('text-xs mt-1.5', index <= step ? 'text-text-1' : 'text-text-3')}>{label}</p>
            </div>
            {index < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mx-2 -mt-5', index < step ? 'bg-success' : 'bg-surface-2')} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-text-1">Source Branch</h3>
            <select
              value={sourceTenant}
              onChange={(e) => {
                const nextSource = e.target.value;
                setSourceTenant(nextSource);
                const nextDest = tenants.find((t) => t.id !== nextSource)?.id || '';
                setDestTenant(nextDest);
                resetSelection();
              }}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-1"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.branchName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {sourceRows.map(({ medicine, qty }) => (
              <div key={medicine.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-1">{medicine.brandName}</p>
                  <p className="text-xs text-text-3">{qty} units available</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={qty}
                  value={lines[medicine.id] ?? ''}
                  onChange={(e) => {
                    const next = Number(e.target.value || 0);
                    setLines((prev) => ({ ...prev, [medicine.id]: Math.min(qty, next) }));
                  }}
                  placeholder="Qty"
                  className="w-20 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-right font-mono text-text-1"
                />
              </div>
            ))}
            {sourceRows.length === 0 && <p className="text-sm text-text-3">No transferable stock in source branch</p>}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-text-1">Destination Branch</h3>
            <select
              value={destTenant}
              onChange={(e) => {
                setDestTenant(e.target.value);
                resetSelection();
              }}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-1"
            >
              {destinationOptions.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.branchName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {sourceRows.map(({ medicine }) => (
              <div key={medicine.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm text-text-1">{medicine.brandName}</p>
                <p className="text-xs text-success font-mono">Current: {destinationQty(medicine.id)} units</p>
              </div>
            ))}
            {sourceRows.length === 0 && <p className="text-sm text-text-3">Select source stock first</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-2">Selected quantity: <span className="font-mono text-text-1">{totalSelected}</span> units</p>
        <div className="flex gap-3">
          <button onClick={resetSelection} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm">
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={proceed}
            disabled={totalSelected === 0 && step === STEPS.length - 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium disabled:opacity-60"
          >
            {step < STEPS.length - 1 ? (
              <>
                Proceed <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Confirm Transfer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
