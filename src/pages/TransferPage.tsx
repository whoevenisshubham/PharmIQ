import { useState } from 'react';
import { mockMedicines, mockBatches, mockTenants } from '@/data/mock';
import { formatINR, cn } from '@/lib/utils';
import { ArrowRight, Check } from 'lucide-react';

const STEPS = ['Initiated', 'In Transit', 'Received', 'Confirmed'];

export function TransferPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [sourceTenant, setSourceTenant] = useState(mockTenants[0].id);
    const [destTenant, setDestTenant] = useState(mockTenants[1].id);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-text-1">Inter-Store Transfer</h1>
                <p className="text-sm text-text-2 mt-1">Transfer stock between branches</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 mb-8 max-w-xl">
                {STEPS.map((step, i) => (
                    <div key={step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                                i < currentStep ? 'bg-success text-white' :
                                    i === currentStep ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-2 text-text-3'
                            )}>
                                {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <p className={cn('text-xs mt-1.5 whitespace-nowrap', i <= currentStep ? 'text-text-1' : 'text-text-3')}>{step}</p>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn('flex-1 h-0.5 mx-2 -mt-5', i < currentStep ? 'bg-success' : 'bg-surface-2')} />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Source Branch */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-semibold text-text-1">Source Branch</h3>
                        <select value={sourceTenant} onChange={e => setSourceTenant(e.target.value)} className="bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-1 focus:border-primary outline-none">
                            {mockTenants.map(t => <option key={t.id} value={t.id}>{t.branchName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        {mockMedicines.slice(0, 5).map(med => {
                            const batch = mockBatches.find(b => b.medicineId === med.id && b.status === 'Available');
                            if (!batch) return null;
                            return (
                                <div key={med.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-text-1">{med.brandName}</p>
                                        <p className="text-xs text-text-3">{batch.quantity} units available</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min={0} max={batch.quantity} placeholder="Qty" className="w-16 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-right font-mono text-text-1 focus:border-primary outline-none" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Destination Branch */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-semibold text-text-1">Destination Branch</h3>
                        <select value={destTenant} onChange={e => setDestTenant(e.target.value)} className="bg-surface-2 border border-border rounded px-2 py-1 text-sm text-text-1 focus:border-primary outline-none">
                            {mockTenants.filter(t => t.id !== sourceTenant).map(t => <option key={t.id} value={t.id}>{t.branchName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        {mockMedicines.slice(0, 5).map(med => {
                            const batch = mockBatches.find(b => b.medicineId === med.id && b.status === 'Available');
                            return (
                                <div key={med.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <p className="text-sm text-text-1">{med.brandName}</p>
                                    <p className="text-xs text-success font-mono">{batch ? `Current: ${Math.round(batch.quantity * 0.3)} units` : 'None'}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm transition-colors">Cancel</button>
                <button onClick={() => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors">
                    {currentStep < STEPS.length - 1 ? (<>Proceed <ArrowRight className="w-4 h-4" /></>) : 'Confirm Transfer'}
                </button>
            </div>
        </div>
    );
}
