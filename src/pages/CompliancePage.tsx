import { mockMedicines, mockSales, mockAuditLogs } from '@/data/mock';
import { formatDateTime, formatDate, cn } from '@/lib/utils';
import { Shield, AlertTriangle, Download } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/common/Badge';

const scheduledMedicines = mockMedicines.filter(m => m.scheduleType !== 'OTC');

function getCompliancePercent(medId: string): number {
    const medSales = mockSales.filter(s => s.items.some(item => item.medicineId === medId));
    const withPrescription = medSales.filter(s => s.items.some(item => item.medicineId === medId && item.prescriptionId));
    if (medSales.length === 0) return 100;
    return Math.round((withPrescription.length / medSales.length) * 100);
}

const ACTION_COLORS: Record<string, string> = {
    Created: 'text-success', Updated: 'text-primary', Deleted: 'text-critical',
    Exported: 'text-warning', Viewed: 'text-text-2', Blocked: 'text-warning', Approved: 'text-success',
};

export function CompliancePage() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'audit'>('schedule');

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Compliance</h1>
                    <p className="text-sm text-text-2 mt-1">Schedule H drug tracking & audit log</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm hover:bg-surface-2 transition-colors">
                    <Download className="w-4 h-4" /> Export for Drug Inspector
                </button>
            </div>

            <div className="flex gap-1 border-b border-border mb-6">
                {[['schedule', 'Schedule H/H1 Drugs'], ['audit', 'Audit Log']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key as any)} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === key ? 'border-primary text-primary' : 'border-transparent text-text-3 hover:text-text-2')}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'schedule' && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-surface-2/50 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-text-1">Schedule H/H1 Compliance Monitor</p>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-surface-2/30">
                            {['Medicine', 'Schedule', 'Sales (30d)', 'Rx Linked', 'Compliance %', 'Alert'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                            {scheduledMedicines.map(med => {
                                const compliance = getCompliancePercent(med.id);
                                // For demo, set varied compliance values
                                const displayCompliance = med.scheduleType === 'H1' ? 100 : med.id === 'M001' ? 92 : med.id === 'M002' ? 78 : med.id === 'M005' ? 65 : 95;
                                return (
                                    <tr key={med.id} className={cn('hover:bg-surface-2/30 transition-colors', displayCompliance < 80 ? 'bg-critical/5' : '')}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text-1">{med.brandName}</p>
                                            <p className="text-xs text-text-3">{med.genericName}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                                                med.scheduleType === 'H1' ? 'bg-critical/10 text-critical border border-critical/20' : 'bg-warning/10 text-warning border border-warning/20'
                                            )}>
                                                Sch-{med.scheduleType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-text-2">{Math.round(Math.random() * 50) + 5}</td>
                                        <td className="px-4 py-3 font-mono text-text-2">{Math.round((displayCompliance / 100) * 30)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 max-w-[80px] bg-surface-2 rounded-full h-1.5">
                                                    <div className={cn('h-1.5 rounded-full', displayCompliance >= 95 ? 'bg-success' : displayCompliance >= 80 ? 'bg-warning' : 'bg-critical')}
                                                        style={{ width: `${displayCompliance}%` }} />
                                                </div>
                                                <span className={cn('font-mono text-xs font-semibold', displayCompliance >= 95 ? 'text-success' : displayCompliance >= 80 ? 'text-warning' : 'text-critical')}>
                                                    {displayCompliance}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {displayCompliance < 80 && (
                                                <span className="flex items-center gap-1 text-xs text-critical">
                                                    <AlertTriangle className="w-3 h-3" /> Review required
                                                </span>
                                            )}
                                            {displayCompliance >= 80 && displayCompliance < 95 && (
                                                <span className="text-xs text-warning">Caution</span>
                                            )}
                                            {displayCompliance >= 95 && (
                                                <span className="text-xs text-success">✓ Compliant</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-surface-2/50">
                            {['Timestamp', 'User', 'Role', 'Module', 'Action', 'IP Address', 'Details'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                            {mockAuditLogs.slice(0, 25).map(log => (
                                <tr key={log.id} className="hover:bg-surface-2/30 transition-colors">
                                    <td className="px-4 py-2.5 text-xs text-text-3 font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                                    <td className="px-4 py-2.5 text-text-1 text-xs font-medium">{log.userName}</td>
                                    <td className="px-4 py-2.5"><Badge variant="muted">{log.role}</Badge></td>
                                    <td className="px-4 py-2.5 text-text-2 text-xs">{log.module}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={cn('text-xs font-medium', ACTION_COLORS[log.action] ?? 'text-text-2')}>{log.action}</span>
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-xs text-text-3">{log.ipAddress}</td>
                                    <td className="px-4 py-2.5 text-xs text-text-3 max-w-48 truncate">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center px-4 py-3 border-t border-border">
                        <span className="text-xs text-text-3">{mockAuditLogs.length} total log entries</span>
                        <button className="text-xs text-primary hover:underline">Load more</button>
                    </div>
                </div>
            )}
        </div>
    );
}
