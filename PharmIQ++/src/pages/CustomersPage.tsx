import { useEffect, useMemo, useState } from 'react';
import { formatINR, formatDate, cn, formatDateTime } from '@/lib/utils';
import { Search, Plus, X, Loader2, Users, Repeat, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer, CustomerTag } from '@/types';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useTenantStore } from '@/stores/tenantStore';
import { useNavigate } from 'react-router-dom';

const TAG_COLORS: Record<CustomerTag, string> = {
    Diabetic: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Hypertensive: 'bg-red-500/10 text-red-400 border-red-500/20',
    Asthma: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Cardiac: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Elderly: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Oncology: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export function CustomersPage() {
    const navigate = useNavigate();
    const currentBranchId = useTenantStore((state) => state.currentTenantId);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        customerType: 'RETAIL' as 'RETAIL' | 'WHOLESALE' | 'INSTITUTIONAL',
        loyaltyPoints: 0,
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [customerData, transactionData] = await Promise.all([
                    apiClient.getCustomers(),
                    apiClient.getPOSTransactions(undefined, undefined, currentBranchId),
                ]);

                setCustomers(Array.isArray(customerData) ? customerData : []);
                setTransactions(Array.isArray(transactionData) ? transactionData : []);
            } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to load customer dashboard');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [currentBranchId]);

    const enrichedCustomers = useMemo(() => {
        const txByCustomer = new Map<string, { totalSpent: number; visits: number; lastVisitDate?: string }>();

        transactions.forEach((tx) => {
            if (!tx.customerId) return;
            const prev = txByCustomer.get(tx.customerId) || { totalSpent: 0, visits: 0, lastVisitDate: undefined };
            const nextDate = !prev.lastVisitDate || new Date(tx.transactionDate) > new Date(prev.lastVisitDate)
                ? tx.transactionDate
                : prev.lastVisitDate;
            txByCustomer.set(tx.customerId, {
                totalSpent: prev.totalSpent + (tx.totalAmount || 0),
                visits: prev.visits + 1,
                lastVisitDate: nextDate,
            });
        });

        return customers.map((customer) => {
            const stats = txByCustomer.get(customer.id);
            const dynamicTags: CustomerTag[] = [];
            if ((stats?.totalSpent || 0) >= 15000) dynamicTags.push('Cardiac');
            if ((stats?.visits || 0) >= 8) dynamicTags.push('Elderly');

            return {
                ...customer,
                totalSpent: Math.round(stats?.totalSpent || 0),
                totalVisits: stats?.visits || 0,
                lastVisitDate: stats?.lastVisitDate ? new Date(stats.lastVisitDate).toISOString().split('T')[0] : customer.createdAt,
                tags: dynamicTags,
            } as Customer;
        });
    }, [customers, transactions]);

    const filtered = enrichedCustomers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
    );

    const totalCustomers = enrichedCustomers.length;
    const activeThisMonth = enrichedCustomers.filter((customer) => {
        if (!customer.lastVisitDate) return false;
        const date = new Date(customer.lastVisitDate);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const totalRevenue = enrichedCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
    const avgRevenuePerCustomer = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    const topCustomer = enrichedCustomers
        .slice()
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];

    const createCustomer = async () => {
        if (!form.name.trim()) {
            toast.error('Customer name is required');
            return;
        }

        setSaving(true);
        try {
            await apiClient.createCustomer({
                name: form.name.trim(),
                phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined,
                address: form.address.trim() || undefined,
                customerType: form.customerType,
                loyaltyPoints: form.loyaltyPoints,
            });

            const latestCustomers = await apiClient.getCustomers();
            setCustomers(Array.isArray(latestCustomers) ? latestCustomers : []);
            setShowAddModal(false);
            setForm({ name: '', phone: '', email: '', address: '', customerType: 'RETAIL', loyaltyPoints: 0 });
            toast.success('Customer created successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create customer');
        } finally {
            setSaving(false);
        }
    };

    const startSaleForCustomer = (customer: Customer) => {
        navigate('/pos', {
            state: {
                customerId: customer.id,
                customerName: customer.name,
                source: 'customers',
            },
        });
        setSelected(null);
    };

    const sendSmsToCustomer = (customer: Customer) => {
        if (!customer.phone) {
            toast.error('No phone number available for this customer');
            return;
        }

        const body = encodeURIComponent(`Hello ${customer.name}, your PharmEZ team is here to help. Reply for refill support.`);
        window.open(`sms:${customer.phone}?body=${body}`, '_blank');
        toast.success(`Opening SMS composer for ${customer.name}`);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Customers</h1>
                    <p className="text-sm text-text-2 mt-1">Live customer intelligence from backend transactions</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Total Customers</p>
                    <p className="text-2xl font-bold text-text-1 mt-2 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{loading ? '...' : totalCustomers}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Active This Month</p>
                    <p className="text-2xl font-bold text-text-1 mt-2 flex items-center gap-2"><Repeat className="w-5 h-5 text-success" />{loading ? '...' : activeThisMonth}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Customer Revenue</p>
                    <p className="text-2xl font-bold text-text-1 mt-2 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-warning" />{loading ? '...' : formatINR(totalRevenue)}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Avg / Customer</p>
                    <p className="text-2xl font-bold text-text-1 mt-2">{loading ? '...' : formatINR(avgRevenuePerCustomer)}</p>
                    <p className="text-xs text-text-3 mt-1">Top: {topCustomer?.name || 'N/A'}</p>
                </div>
            </div>

            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none" />
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                            {['Customer', 'Phone', 'Total Spent', 'Visits', 'Last Visit', 'Segment'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-text-3">
                                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading customers...</span>
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-text-3">No customers found</td>
                            </tr>
                        )}
                        {!loading && filtered.map(c => (
                            <tr key={c.id} className="hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-primary">{c.name[0]}</span>
                                        </div>
                                        <p className="font-medium text-text-1">{c.name}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-text-2">{c.phone || '—'}</td>
                                <td className="px-4 py-3 font-mono font-medium text-text-1">{formatINR(c.totalSpent)}</td>
                                <td className="px-4 py-3 text-text-2">{c.totalVisits}</td>
                                <td className="px-4 py-3 text-text-2 text-xs">{formatDate(c.lastVisitDate)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {c.tags.length === 0 && <span className="text-xs text-text-3">General</span>}
                                        {c.tags.map(tag => (
                                            <span key={tag} className={cn('text-xs px-1.5 py-0.5 rounded-full border', TAG_COLORS[tag])}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
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
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()} className="relative z-[140] w-full max-w-md md:w-[520px] h-full bg-surface border-l border-border shadow-2xl overflow-y-auto">
                                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border sticky top-0 z-[141] bg-surface/95 backdrop-blur-sm">
                                    <div className="flex min-w-0 items-center gap-4 pr-2 flex-1">
                                        <div className="w-20 h-28 rounded-2xl bg-gradient-to-br from-primary/6 to-primary/3 flex items-center justify-center shrink-0 shadow-md">
                                            <div className="text-2xl font-extrabold text-primary">{selected.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg md:text-xl font-display font-semibold text-text-1 leading-tight truncate">{selected.name}</p>
                                            <div className="mt-1 flex items-center gap-3">
                                                <p className="text-sm text-text-3">{selected.phone || '—'}</p>
                                                <div className="flex gap-1">
                                                    {selected.tags.slice(0,2).map(tag => (
                                                        <span key={tag} className={cn('text-xs px-2 py-0.5 rounded-full border', TAG_COLORS[tag])}>{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-[142]">
                                        <button onClick={() => startSaleForCustomer(selected)} className="px-3 py-1.5 bg-primary rounded-md text-sm text-white">New Sale</button>
                                        <button onClick={() => sendSmsToCustomer(selected)} className="px-3 py-1.5 border border-border rounded-md text-sm text-text-2">SMS</button>
                                        <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 flex-shrink-0"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-5">
                                        <div className="w-40 h-56 rounded-2xl bg-surface-2/40 flex items-center justify-center text-3xl text-text-3">{selected.name.split(' ')[0]}</div>
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            {[
                                                ['Total Spent', formatINR(selected.totalSpent)], ['Total Visits', String(selected.totalVisits)],
                                                ['Loyalty Points', String(selected.loyaltyPoints)], ['Last Visit', formatDate(selected.lastVisitDate)],
                                                ['Member Since', formatDate(selected.createdAt)], ['Email', selected.email || '—'],
                                                ['Phone', selected.phone || '—'], ['Address', selected.address || '—'],
                                            ].map(([l, v]) => (
                                                <div key={l} className="bg-surface-2 rounded-lg p-3">
                                                    <p className="text-xs text-text-3 mb-1">{l}</p>
                                                    <p className="text-sm font-medium text-text-1">{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                <div className="flex gap-1 flex-wrap">
                                    {selected.tags.length === 0 && <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-3">General</span>}
                                    {selected.tags.map(tag => (
                                        <span key={tag} className={cn('text-xs px-2 py-0.5 rounded-full border', TAG_COLORS[tag])}>{tag}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ['Total Spent', formatINR(selected.totalSpent)], ['Total Visits', String(selected.totalVisits)],
                                        ['Loyalty Points', String(selected.loyaltyPoints)], ['Last Visit', formatDate(selected.lastVisitDate)],
                                        ['Member Since', formatDate(selected.createdAt)], ['Email', selected.email || '—'],
                                        ['Phone', selected.phone || '—'], ['Address', selected.address || '—'],
                                    ].map(([l, v]) => (
                                        <div key={l} className="bg-surface-2 rounded-lg p-3">
                                            <p className="text-xs text-text-3 mb-1">{l}</p>
                                            <p className="text-sm font-medium text-text-1">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-xl border border-border bg-surface-2/40 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border text-xs uppercase tracking-wider text-text-3">Recent Purchases</div>
                                    <div className="divide-y divide-border">
                                        {transactions
                                            .filter((tx) => tx.customerId === selected.id)
                                            .slice(0, 5)
                                            .map((tx) => (
                                                <div key={tx.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm text-text-1 font-mono">{tx.id.slice(0, 10).toUpperCase()}</p>
                                                        <p className="text-xs text-text-3">{formatDateTime(tx.transactionDate)}</p>
                                                    </div>
                                                    <p className="text-sm font-mono text-text-1">{formatINR(tx.totalAmount || 0)}</p>
                                                </div>
                                            ))}
                                        {transactions.filter((tx) => tx.customerId === selected.id).length === 0 && (
                                            <div className="px-4 py-4 text-xs text-text-3">No purchases yet</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="button" onClick={() => startSaleForCustomer(selected)} className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors">New Sale</button>
                                    <button type="button" onClick={() => sendSmsToCustomer(selected)} className="flex-1 py-2.5 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm transition-colors">Send SMS</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
                        <div className="absolute inset-0 bg-black/50" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl rounded-xl border border-border bg-surface p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text-1">Add Customer</h3>
                                <button type="button" onClick={() => setShowAddModal(false)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2"><X className="w-4 h-4" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Customer Name *</label>
                                    <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Suresh Mehta" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1 placeholder-text-3" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Phone</label>
                                    <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="e.g. 9876543210" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1 placeholder-text-3" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Email</label>
                                    <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="e.g. customer@email.com" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1 placeholder-text-3" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Address</label>
                                    <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="e.g. Bibwewadi, Pune" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1 placeholder-text-3" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Customer Type</label>
                                    <select value={form.customerType} onChange={(e) => setForm((prev) => ({ ...prev, customerType: e.target.value as 'RETAIL' | 'WHOLESALE' | 'INSTITUTIONAL' }))} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1">
                                        <option value="RETAIL">Retail</option>
                                        <option value="WHOLESALE">Wholesale</option>
                                        <option value="INSTITUTIONAL">Institutional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-text-3 mb-1 block">Opening Loyalty Points</label>
                                    <input type="number" min={0} value={form.loyaltyPoints} onChange={(e) => setForm((prev) => ({ ...prev, loyaltyPoints: Number(e.target.value || 0) }))} placeholder="e.g. 120" className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-1 placeholder-text-3" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-2">Cancel</button>
                                <button type="button" onClick={createCustomer} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Create Customer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
