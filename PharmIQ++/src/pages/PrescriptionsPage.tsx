import { useState, useMemo } from 'react';
import { mockPrescriptions, mockCustomers } from '@/data/mock';
import { formatDate, cn } from '@/lib/utils';
import { Search, Eye, X, FileText, Plus, Link2, CheckCircle, AlertCircle, Clock, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prescription } from '@/types';
import { Badge } from '@/components/common/Badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<Prescription['status'], 'success' | 'warning' | 'critical' | 'muted' | 'info'> = {
    Active: 'success', Dispensed: 'info', Expired: 'critical', 'Pending Review': 'warning',
};

const STATUS_ICONS: Record<Prescription['status'], React.ReactNode> = {
    Active: <CheckCircle className="w-4 h-4 text-success" />,
    Dispensed: <Link2 className="w-4 h-4 text-info" />,
    Expired: <AlertCircle className="w-4 h-4 text-critical" />,
    'Pending Review': <Clock className="w-4 h-4 text-warning" />,
};

export function PrescriptionsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Prescription | null>(null);

    const filtered = useMemo(() =>
        mockPrescriptions.filter(p =>
            p.customerName.toLowerCase().includes(search.toLowerCase()) ||
            p.doctorName.toLowerCase().includes(search.toLowerCase()) ||
            p.mciRegNo.toLowerCase().includes(search.toLowerCase())
        ), [search]
    );

    const stats = useMemo(() => ({
        total: mockPrescriptions.length,
        active: mockPrescriptions.filter(p => p.status === 'Active').length,
        pending: mockPrescriptions.filter(p => p.status === 'Pending Review').length,
        dispensed: mockPrescriptions.filter(p => p.status === 'Dispensed').length,
        expired: mockPrescriptions.filter(p => p.status === 'Expired').length,
    }), []);

    const createSaleFromPrescription = (rx: Prescription) => {
        navigate('/pos', {
            state: {
                customerId: rx.customerId,
                customerName: rx.customerName,
                prescriptionId: rx.id,
                medicines: rx.medicines,
                source: 'prescriptions',
            },
        });
        setSelected(null);
    };

    const getCustomerDetails = (customerId: string) => {
        return mockCustomers.find(c => c.id === customerId);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1 flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Prescriptions</h1>
                    <p className="text-sm text-text-2 mt-1">Manage and fulfill patient prescriptions</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
                <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Total Rx</p>
                    <p className="text-2xl font-bold text-text-1 mt-2">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Active</p>
                    <p className="text-2xl font-bold text-success mt-2">{stats.active}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Pending Review</p>
                    <p className="text-2xl font-bold text-warning mt-2">{stats.pending}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Dispensed</p>
                    <p className="text-2xl font-bold text-info mt-2">{stats.dispensed}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Expired</p>
                    <p className="text-2xl font-bold text-critical mt-2">{stats.expired}</p>
                </div>
            </div>

            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient, doctor, or MCI no..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none" />
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
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-text-3">No prescriptions found</td>
                            </tr>
                        )}
                        {filtered.map(rx => (
                            <tr key={rx.id} className="hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setSelected(rx)}>
                                <td className="px-4 py-3 font-medium text-text-1">{rx.customerName}</td>
                                <td className="px-4 py-3 text-text-2 text-sm">{rx.doctorName}</td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{rx.mciRegNo}</td>
                                <td className="px-4 py-3 text-xs text-text-2">{formatDate(rx.prescriptionDate)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {rx.medicines.slice(0, 2).map(m => <span key={m} className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary">{m}</span>)}
                                        {rx.medicines.length > 2 && <span className="text-xs px-2 py-0.5 rounded-full text-text-3">+{rx.medicines.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {STATUS_ICONS[rx.status]}
                                        <Badge variant={STATUS_VARIANT[rx.status]}>{rx.status}</Badge>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">
                                    {rx.linkedSaleId ? (
                                        <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">{rx.linkedSaleId}</span>
                                    ) : (
                                        <span className="text-text-3">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={(e) => { e.stopPropagation(); setSelected(rx); }} className="p-1.5 text-text-3 hover:text-primary hover:bg-primary/10 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[130] flex justify-end" onClick={() => setSelected(null)}>
                        <div className="absolute inset-0 bg-black/40" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()} className="relative w-full max-w-2xl h-full bg-surface border-l border-border shadow-2xl overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-sm">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-display font-semibold text-text-1">Prescription {selected.id}</p>
                                        <div className="mt-1 flex items-center gap-3">
                                            <Badge variant={STATUS_VARIANT[selected.status]} className="text-xs">{selected.status}</Badge>
                                            {selected.linkedSaleId && <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">Linked to {selected.linkedSaleId}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selected.status === 'Active' && !selected.linkedSaleId && (
                                        <button onClick={() => createSaleFromPrescription(selected)} className="px-4 py-2 bg-primary rounded-lg text-sm text-white font-medium hover:bg-primary-dim transition-colors">
                                            <Plus className="w-4 h-4 inline mr-2" /> Create Sale
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 flex-shrink-0"><X className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Patient & Doctor Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                                        <p className="text-xs uppercase tracking-wider text-text-3 mb-1">Patient</p>
                                        <p className="text-base font-semibold text-text-1">{selected.customerName}</p>
                                        {getCustomerDetails(selected.customerId)?.phone && (
                                            <p className="text-xs text-text-2 mt-1">{getCustomerDetails(selected.customerId)!.phone}</p>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                                        <p className="text-xs uppercase tracking-wider text-text-3 mb-1">Doctor</p>
                                        <p className="text-base font-semibold text-text-1">{selected.doctorName}</p>
                                        <p className="text-xs text-text-2 mt-1">MCI: {selected.mciRegNo}</p>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-surface-2 p-3">
                                        <p className="text-xs text-text-3 uppercase tracking-wider">Date</p>
                                        <p className="text-sm font-semibold text-text-1 mt-1">{formatDate(selected.prescriptionDate)}</p>
                                    </div>
                                    <div className="rounded-lg bg-surface-2 p-3">
                                        <p className="text-xs text-text-3 uppercase tracking-wider">Status</p>
                                        <Badge variant={STATUS_VARIANT[selected.status]} className="text-xs mt-1">{selected.status}</Badge>
                                    </div>
                                </div>

                                {/* Medicines Section */}
                                <div className="rounded-lg border border-border bg-surface-2/40 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-border bg-surface-2/60 text-xs uppercase tracking-wider text-text-3 font-semibold">Prescribed Medicines ({selected.medicines.length})</div>
                                    <div className="divide-y divide-border">
                                        {selected.medicines.map((medicine, idx) => (
                                            <div key={idx} className="px-4 py-2 flex items-center gap-2 hover:bg-surface-2/20 transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{idx + 1}</div>
                                                <p className="text-sm text-text-1">{medicine}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    {selected.status === 'Active' && !selected.linkedSaleId && (
                                        <button onClick={() => createSaleFromPrescription(selected)} className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Create Sale
                                        </button>
                                    )}
                                    {selected.linkedSaleId && (
                                        <button onClick={() => { navigate(`/pos?saleId=${selected.linkedSaleId}`); setSelected(null); }} className="flex-1 py-2.5 rounded-lg border border-success/50 hover:bg-success/10 text-success text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                            <Link2 className="w-4 h-4" /> View {selected.linkedSaleId}
                                        </button>
                                    )}
                                    <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm font-medium transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
