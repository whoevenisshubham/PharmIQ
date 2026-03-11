import { useState } from 'react';
import { mockCustomers } from '@/data/mock';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer, CustomerTag } from '@/types';
import { Badge } from '@/components/common/Badge';

const TAG_COLORS: Record<CustomerTag, string> = {
    Diabetic: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Hypertensive: 'bg-red-500/10 text-red-400 border-red-500/20',
    Asthma: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Cardiac: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Elderly: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Oncology: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export function CustomersPage() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);

    const filtered = mockCustomers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Customers</h1>
                    <p className="text-sm text-text-2 mt-1">{mockCustomers.length} registered customers</p>
                </div>
                <button
                    onClick={() => {
                        import('sonner').then(m => m.toast.success('Add Customer Form', { description: 'Opening the customer creation form.' }));
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none" />
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                            {['Customer', 'Phone', 'Total Spent', 'Visits', 'Last Visit', 'Tags', 'Loyalty Pts', ''].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(c => (
                            <tr key={c.id} className="hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-primary">{c.name[0]}</span>
                                        </div>
                                        <p className="font-medium text-text-1">{c.name}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{c.phone}</td>
                                <td className="px-4 py-3 font-mono font-medium text-text-1">{formatINR(c.totalSpent)}</td>
                                <td className="px-4 py-3 text-text-2">{c.totalVisits}</td>
                                <td className="px-4 py-3 text-text-2 text-xs">{formatDate(c.lastVisitDate)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {c.tags.map(tag => (
                                            <span key={tag} className={cn('text-xs px-1.5 py-0.5 rounded-full border', TAG_COLORS[tag])}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-primary font-medium font-mono">{c.loyaltyPoints}</span>
                                </td>
                                <td className="px-4 py-3" />
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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary">{selected.name[0]}</span>
                                    </div>
                                    <div>
                                        <p className="font-display font-semibold text-text-1">{selected.name}</p>
                                        <p className="text-xs text-text-3">{selected.phone}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex gap-1 flex-wrap">
                                    {selected.tags.map(tag => (
                                        <span key={tag} className={cn('text-xs px-2 py-0.5 rounded-full border', TAG_COLORS[tag])}>{tag}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ['Total Spent', formatINR(selected.totalSpent)], ['Total Visits', String(selected.totalVisits)],
                                        ['Loyalty Points', String(selected.loyaltyPoints)], ['Last Visit', formatDate(selected.lastVisitDate)],
                                        ['Member Since', formatDate(selected.createdAt)],
                                    ].map(([l, v]) => (
                                        <div key={l} className="bg-surface-2 rounded-lg p-3">
                                            <p className="text-xs text-text-3 mb-1">{l}</p>
                                            <p className="text-sm font-medium text-text-1">{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors">New Sale</button>
                                    <button className="flex-1 py-2.5 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm transition-colors">Send SMS</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
