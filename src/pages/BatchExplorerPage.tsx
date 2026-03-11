import { mockBatches, mockMedicines } from '@/data/mock';
import { formatDate, formatINR, cn } from '@/lib/utils';
import { daysUntilExpiry, getExpiryStatus } from '@/lib/fefo';
import { BatchStatusBadge } from '@/components/common/Badge';

export function BatchExplorerPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-text-1">Batch Explorer</h1>
                <p className="text-sm text-text-2 mt-1">Full batch timeline across all medicines</p>
            </div>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-surface-2/50">
                        {['Batch No', 'Medicine', 'Expiry', 'Days Left', 'Qty', 'MRP', 'Purchase Rate', 'Status'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {mockBatches.map(batch => {
                            const med = mockMedicines.find(m => m.id === batch.medicineId);
                            const days = daysUntilExpiry(batch.expiryDate);
                            const status = getExpiryStatus(batch.expiryDate);
                            return (
                                <tr key={batch.id} className={cn(
                                    'hover:bg-surface-2/30 transition-colors',
                                    status === 'expired' ? 'row-expired' : status === 'critical' ? 'row-near-expiry-30' : status === 'warning' ? 'row-near-expiry-90' : ''
                                )}>
                                    <td className="px-4 py-2.5 font-mono text-xs text-text-1">{batch.batchNo}</td>
                                    <td className="px-4 py-2.5 font-medium text-text-1">{med?.brandName}</td>
                                    <td className="px-4 py-2.5 text-xs text-text-2">{formatDate(batch.expiryDate)}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={cn('font-mono text-xs font-semibold', days < 0 ? 'text-critical' : days <= 30 ? 'text-critical' : days <= 90 ? 'text-warning' : 'text-success')}>
                                            {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-text-2">{batch.quantity}</td>
                                    <td className="px-4 py-2.5 font-mono text-text-1">{formatINR(batch.mrp)}</td>
                                    <td className="px-4 py-2.5 font-mono text-text-2">{formatINR(batch.purchaseRate)}</td>
                                    <td className="px-4 py-2.5"><BatchStatusBadge status={batch.status} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
