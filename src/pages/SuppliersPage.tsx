import { useState } from 'react';
import { mockSuppliers } from '@/data/mock';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { Search, Plus, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Supplier } from '@/types';
import { Badge } from '@/components/common/Badge';

export function SuppliersPage() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Supplier | null>(null);

    const filtered = mockSuppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.gstin.includes(search) || s.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Suppliers</h1>
                    <p className="text-sm text-text-2 mt-1">{mockSuppliers.length} active suppliers</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium">
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none" />
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                            {['Supplier', 'GSTIN', 'City', 'Total Purchases', 'Outstanding', 'Last Order', 'Status', ''].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-text-1">{s.name}</p>
                                    <p className="text-xs text-text-3">{s.phone}</p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{s.gstin}</td>
                                <td className="px-4 py-3 text-text-2">{s.city}</td>
                                <td className="px-4 py-3 font-mono text-text-1 font-medium">{formatINR(s.totalPurchases)}</td>
                                <td className="px-4 py-3">
                                    <span className={cn('font-mono font-medium', s.outstanding > 0 ? 'text-warning' : 'text-success')}>
                                        {s.outstanding > 0 ? formatINR(s.outstanding) : 'Nil'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-text-2 text-xs">{formatDate(s.lastOrderDate)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={s.status === 'Active' ? 'success' : 'muted'}>{s.status}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => setSelected(s)} className="p-1.5 text-text-3 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
                        <div className="absolute inset-0 bg-black/40" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()} className="relative w-96 h-full bg-surface border-l border-border shadow-2xl overflow-y-auto">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface">
                                <h3 className="font-display font-semibold text-text-1">{selected.name}</h3>
                                <button onClick={() => setSelected(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ['GSTIN', selected.gstin, true], ['Phone', selected.phone, false],
                                        ['Email', selected.email, false], ['City', selected.city, false],
                                        ['Total Purchases', formatINR(selected.totalPurchases), true], ['Outstanding', formatINR(selected.outstanding), true],
                                    ].map(([l, v, m]) => (
                                        <div key={l as string} className="bg-surface-2 rounded-lg p-3">
                                            <p className="text-xs text-text-3 mb-1">{l}</p>
                                            <p className={cn('text-text-1 font-medium', m ? 'font-mono text-xs' : 'text-sm')}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs text-text-3 mb-2 font-medium">Address</p>
                                    <p className="text-sm text-text-2">{selected.address}</p>
                                </div>
                                <button className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors">
                                    Record Payment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
