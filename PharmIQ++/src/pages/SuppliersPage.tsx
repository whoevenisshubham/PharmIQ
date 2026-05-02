import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/client';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { Search, Plus, Eye, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/common/Badge';
import { toast } from 'sonner';

type SupplierRecord = {
    id: string;
    name: string;
    gstNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    createdAt: string;
    batches?: Array<{ id: string }>;
    invoices?: Array<{ id: string; totalAmount?: number | null; createdAt?: string | null }>;
};

type SupplierForm = {
    name: string;
    gstNumber: string;
    phone: string;
    email: string;
    address: string;
};

export function SuppliersPage() {
    const [search, setSearch] = useState('');
    const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
    const [selected, setSelected] = useState<SupplierRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<SupplierForm>({
        name: '',
        gstNumber: '',
        phone: '',
        email: '',
        address: '',
    });

    const loadSuppliers = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.getSuppliers();
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to load suppliers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadSuppliers();
    }, []);

    const filtered = useMemo(() => (
        suppliers.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.gstNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.phone || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(search.toLowerCase())
        )
    ), [suppliers, search]);

    const createSupplier = async () => {
        if (!form.name.trim()) {
            toast.error('Supplier name is required');
            return;
        }

        setIsCreating(true);
        try {
            const created = await apiClient.createSupplier({
                name: form.name.trim(),
                gstNumber: form.gstNumber.trim() || undefined,
                phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined,
                address: form.address.trim() || undefined,
            });

            setSuppliers((prev) => [created, ...prev]);
            setIsCreateOpen(false);
            setForm({ name: '', gstNumber: '', phone: '', email: '', address: '' });
            toast.success('Supplier created successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create supplier');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Suppliers</h1>
                    <p className="text-sm text-text-2 mt-1">{suppliers.length} suppliers in current tenant</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium"
                >
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
                            {['Supplier', 'GSTIN', 'Phone', 'Invoices', 'Batches', 'Added On', 'Status', ''].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-text-2">
                                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading suppliers...</span>
                                </td>
                            </tr>
                        )}

                        {!isLoading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-text-2">
                                    No suppliers found. Add a supplier to get started.
                                </td>
                            </tr>
                        )}

                        {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-text-1">{s.name}</p>
                                    <p className="text-xs text-text-3">{s.email || 'No email'}</p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{s.gstNumber || 'N/A'}</td>
                                <td className="px-4 py-3 text-text-2">{s.phone || 'N/A'}</td>
                                <td className="px-4 py-3 text-text-2">{s.invoices?.length || 0}</td>
                                <td className="px-4 py-3 text-text-2">{s.batches?.length || 0}</td>
                                <td className="px-4 py-3 text-text-2 text-xs">{formatDate(s.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant="success">Active</Badge>
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
                                        ['GSTIN', selected.gstNumber || 'N/A', true], ['Phone', selected.phone || 'N/A', false],
                                        ['Email', selected.email || 'N/A', false], ['Invoices', String(selected.invoices?.length || 0), false],
                                        ['Batches', String(selected.batches?.length || 0), false], ['Created', formatDate(selected.createdAt), false],
                                    ].map(([l, v, m]) => (
                                        <div key={l as string} className="bg-surface-2 rounded-lg p-3">
                                            <p className="text-xs text-text-3 mb-1">{l}</p>
                                            <p className={cn('text-text-1 font-medium', m ? 'font-mono text-xs' : 'text-sm')}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs text-text-3 mb-2 font-medium">Address</p>
                                    <p className="text-sm text-text-2">{selected.address || 'N/A'}</p>
                                </div>
                                <button className="w-full py-2.5 rounded-lg bg-surface-2 text-text-2 text-sm font-medium transition-colors" onClick={() => setSelected(null)}>
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsCreateOpen(false)}>
                        <div className="absolute inset-0 bg-black/50" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-5 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-1">Add Supplier</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Supplier name *"
                                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
                                />
                                <input
                                    value={form.gstNumber}
                                    onChange={(e) => setForm((prev) => ({ ...prev, gstNumber: e.target.value }))}
                                    placeholder="GST number"
                                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
                                />
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Phone"
                                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
                                />
                                <input
                                    value={form.email}
                                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email"
                                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
                                />
                            </div>

                            <textarea
                                value={form.address}
                                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                                placeholder="Address"
                                rows={3}
                                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-lg border border-border px-4 py-2 text-sm text-text-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createSupplier}
                                    disabled={isCreating}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    {isCreating ? 'Creating...' : 'Create Supplier'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
