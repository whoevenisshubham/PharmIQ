import { mockSales } from '@/data/mock';
import { formatINR, formatDateTime, cn } from '@/lib/utils';

export function PurchaseHistoryPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-text-1">Purchase History</h1>
                <p className="text-sm text-text-2 mt-1">All procurement records</p>
            </div>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-surface-2/50">
                        {['Invoice No', 'Date', 'Customer', 'Amount', 'Payment', 'Created By'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {mockSales.slice(0, 20).map(s => (
                            <tr key={s.id} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-2.5 font-mono text-xs text-primary">{s.invoiceNo}</td>
                                <td className="px-4 py-2.5 text-xs text-text-2">{formatDateTime(s.createdAt)}</td>
                                <td className="px-4 py-2.5 text-text-1">{s.customerName}</td>
                                <td className="px-4 py-2.5 font-mono font-bold text-text-1">{formatINR(s.grandTotal)}</td>
                                <td className="px-4 py-2.5">
                                    <span className={cn('text-xs px-2 py-0.5 rounded-full',
                                        s.paymentMethod === 'Cash' ? 'bg-success/10 text-success' :
                                            s.paymentMethod === 'UPI' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                                    )}>{s.paymentMethod}</span>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-text-3">{s.createdBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
