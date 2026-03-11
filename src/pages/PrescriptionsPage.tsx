import { useState } from 'react';
import { mockPrescriptions } from '@/data/mock';
import { formatDate, cn } from '@/lib/utils';
import { Search, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prescription } from '@/types';
import { Badge } from '@/components/common/Badge';

const STATUS_VARIANT: Record<Prescription['status'], 'success' | 'warning' | 'critical' | 'muted' | 'info'> = {
    Active: 'success', Dispensed: 'info', Expired: 'critical', 'Pending Review': 'warning',
};

export function PrescriptionsPage() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Prescription | null>(null);

    const filtered = mockPrescriptions.filter(p =>
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.doctorName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Prescriptions</h1>
                    <p className="text-sm text-text-2 mt-1">{mockPrescriptions.length} prescriptions</p>
                </div>
            </div>
            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or doctor..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none" />
            </div>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                            {['Patient', 'Doctor', 'MCI No', 'Date', 'Medicines', 'Status', 'Linked Sale', ''].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(rx => (
                            <tr key={rx.id} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-text-1">{rx.customerName}</td>
                                <td className="px-4 py-3 text-text-2">{rx.doctorName}</td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{rx.mciRegNo}</td>
                                <td className="px-4 py-3 text-xs text-text-2">{formatDate(rx.prescriptionDate)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {rx.medicines.map(m => <span key={m} className="text-xs bg-surface-2 px-2 py-0.5 rounded text-text-2">{m}</span>)}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[rx.status]}>{rx.status}</Badge></td>
                                <td className="px-4 py-3 font-mono text-xs text-primary">{rx.linkedSaleId ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => setSelected(rx)} className="p-1.5 text-text-3 hover:text-primary hover:bg-primary/10 rounded"><Eye className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <h3 className="font-display font-semibold text-text-1">Prescription Detail — {selected.id}</h3>
                                <button onClick={() => setSelected(null)} className="p-1.5 text-text-3 hover:text-text-1 hover:bg-surface-2 rounded"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <img src={selected.imageUrl} alt="Prescription" className="w-full rounded-lg border border-border" />
                                </div>
                                <div className="space-y-3 text-sm">
                                    {[
                                        ['Patient', selected.customerName], ['Doctor', selected.doctorName],
                                        ['MCI Reg', selected.mciRegNo], ['Date', formatDate(selected.prescriptionDate)],
                                        ['Status', selected.status], ['Linked Sale', selected.linkedSaleId ?? 'None'],
                                    ].map(([l, v]) => (
                                        <div key={l}>
                                            <p className="text-xs text-text-3 mb-0.5">{l}</p>
                                            <p className="text-text-1 font-medium">{v}</p>
                                        </div>
                                    ))}
                                    <div>
                                        <p className="text-xs text-text-3 mb-1">Medicines</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selected.medicines.map(m => <span key={m} className="text-xs bg-surface-2 px-2 py-0.5 rounded text-text-2">{m}</span>)}
                                        </div>
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
