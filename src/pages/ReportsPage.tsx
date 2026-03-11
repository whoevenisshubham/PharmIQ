import { useState } from 'react';
import { mockSales, mockSuppliers, mockMedicines, mockBatches } from '@/data/mock';
import { formatINR, formatDate, formatDateTime, cn } from '@/lib/utils';
import { Download, Calendar } from 'lucide-react';

const TABS = ['Sales', 'Purchases', 'GST', 'Profit & Loss', 'Expiry Loss'] as const;
type Tab = typeof TABS[number];

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Custom'];

const gstData = mockSales.slice(0, 10).map((s, i) => ({
    invoiceNo: s.invoiceNo,
    customer: s.customerName,
    taxableValue: s.subtotal,
    cgst: s.totalGst / 2,
    sgst: s.totalGst / 2,
    igst: 0,
    total: s.grandTotal,
    hsnCode: '30049099',
}));

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('Sales');
    const [datePreset, setDatePreset] = useState('This Month');

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Reports</h1>
                    <p className="text-sm text-text-2 mt-1">Financial and operational reports</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm hover:bg-surface-2 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                            activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-3 hover:text-text-2'
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Date filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex gap-1">
                    {DATE_PRESETS.map(p => (
                        <button
                            key={p}
                            onClick={() => setDatePreset(p)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-sm transition-colors',
                                datePreset === p ? 'bg-primary text-white' : 'text-text-3 hover:text-text-2 hover:bg-surface'
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                {datePreset === 'Custom' && (
                    <div className="flex items-center gap-2">
                        <input type="date" className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-1 focus:border-primary outline-none" />
                        <span className="text-text-3">to</span>
                        <input type="date" className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-1 focus:border-primary outline-none" />
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {activeTab === 'Sales' && [
                    { label: 'Total Revenue', value: formatINR(245000) },
                    { label: 'Net Revenue', value: formatINR(221000) },
                    { label: 'Total Orders', value: '412' },
                    { label: 'Average Order', value: formatINR(537) },
                ].map(card => (
                    <div key={card.label} className="bg-surface border border-border rounded-xl px-4 py-3">
                        <p className="text-xs text-text-3 mb-1">{card.label}</p>
                        <p className="text-lg font-bold font-display text-text-1">{card.value}</p>
                    </div>
                ))}
                {activeTab === 'GST' && [
                    { label: 'Taxable Value', value: formatINR(212000) },
                    { label: 'CGST', value: formatINR(14400) },
                    { label: 'SGST', value: formatINR(14400) },
                    { label: 'Total GST', value: formatINR(28800) },
                ].map(card => (
                    <div key={card.label} className="bg-surface border border-border rounded-xl px-4 py-3">
                        <p className="text-xs text-text-3 mb-1">{card.label}</p>
                        <p className="text-lg font-bold font-display text-text-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {activeTab === 'Sales' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-2/50">
                                {['Invoice No', 'Date & Time', 'Patient', 'Items', 'Subtotal', 'GST', 'Discount', 'Total', 'Payment'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {mockSales.slice(0, 15).map(sale => (
                                    <tr key={sale.id} className="hover:bg-surface-2/30 transition-colors">
                                        <td className="px-4 py-2.5 font-mono text-xs text-primary">{sale.invoiceNo}</td>
                                        <td className="px-4 py-2.5 text-xs text-text-2">{formatDateTime(sale.createdAt)}</td>
                                        <td className="px-4 py-2.5 text-text-1">{sale.customerName}</td>
                                        <td className="px-4 py-2.5 text-text-2">{sale.items.length}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(sale.subtotal)}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(sale.totalGst)}</td>
                                        <td className="px-4 py-2.5 font-mono text-success">{sale.discount > 0 ? formatINR(sale.discount) : '—'}</td>
                                        <td className="px-4 py-2.5 font-mono font-bold text-text-1">{formatINR(sale.grandTotal)}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full',
                                                sale.paymentMethod === 'Cash' ? 'bg-success/10 text-success' :
                                                    sale.paymentMethod === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                                            )}>{sale.paymentMethod}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'GST' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-2/50">
                                {['Invoice No', 'Customer', 'HSN Code', 'Taxable Value', 'CGST 6%', 'SGST 6%', 'IGST', 'Total'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {gstData.map(row => (
                                    <tr key={row.invoiceNo} className="hover:bg-surface-2/30 transition-colors">
                                        <td className="px-4 py-2.5 font-mono text-xs text-primary">{row.invoiceNo}</td>
                                        <td className="px-4 py-2.5 text-text-1">{row.customer}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-text-2">{row.hsnCode}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(row.taxableValue)}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(row.cgst)}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(row.sgst)}</td>
                                        <td className="px-4 py-2.5 text-text-3">—</td>
                                        <td className="px-4 py-2.5 font-mono font-bold text-text-1">{formatINR(row.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'Purchases' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-2/50">
                                {['Supplier', 'GSTIN', 'Total Purchases', 'Outstanding', 'Last Order', 'Status'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {mockSuppliers.map(s => (
                                    <tr key={s.id} className="hover:bg-surface-2/30 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-text-1">{s.name}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-text-2">{s.gstin}</td>
                                        <td className="px-4 py-2.5 font-mono text-text-1">{formatINR(s.totalPurchases)}</td>
                                        <td className="px-4 py-2.5 font-mono text-critical">{s.outstanding > 0 ? formatINR(s.outstanding) : '—'}</td>
                                        <td className="px-4 py-2.5 text-text-2">{formatDate(s.lastOrderDate)}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full', s.status === 'Active' ? 'bg-success/10 text-success' : 'bg-text-3/10 text-text-3')}>{s.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'Expiry Loss' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-2/50">
                                {['Batch No', 'Medicine', 'Qty', 'Purchase Rate', 'Loss Value', 'Supplier', 'Status'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {mockBatches.filter(b => b.status === 'Expired').map(b => {
                                    const m = mockMedicines.find(x => x.id === b.medicineId);
                                    const s = mockSuppliers.find(x => x.id === b.supplierId);
                                    const loss = b.quantity * b.purchaseRate;
                                    return (
                                        <tr key={b.id} className="hover:bg-surface-2/30 transition-colors bg-critical/5">
                                            <td className="px-4 py-2.5 font-mono text-xs text-primary">{b.batchNo}</td>
                                            <td className="px-4 py-2.5 text-text-1">{m?.brandName}</td>
                                            <td className="px-4 py-2.5 font-mono text-text-2">{b.quantity}</td>
                                            <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(b.purchaseRate)}</td>
                                            <td className="px-4 py-2.5 font-mono font-bold text-critical">{formatINR(loss)}</td>
                                            <td className="px-4 py-2.5 text-text-2">{s?.name}</td>
                                            <td className="px-4 py-2.5 text-critical text-xs font-medium">Expired</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'Profit & Loss' && (
                    <div className="p-6 max-w-2xl mx-auto">
                        <div className="bg-surface-2 border border-border rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-text-2">
                                <span>Gross Revenue</span>
                                <span className="font-mono text-text-1">{formatINR(1250000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-text-2">
                                <span>Returns & Discounts</span>
                                <span className="font-mono text-critical">-{formatINR(45000)}</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-text-1">Net Revenue</span>
                                <span className="font-mono text-primary">{formatINR(1205000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-text-2 mt-4">
                                <span>Cost of Goods Sold (COGS)</span>
                                <span className="font-mono text-text-1">{formatINR(850000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-text-2">
                                <span>Operating Expenses</span>
                                <span className="font-mono text-text-1">{formatINR(120000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-text-2">
                                <span>Expiry & Damage Loss</span>
                                <span className="font-mono text-critical">{formatINR(15000)}</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span className="text-text-1">Net Profit</span>
                                <span className="font-mono text-success">{formatINR(220000)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
