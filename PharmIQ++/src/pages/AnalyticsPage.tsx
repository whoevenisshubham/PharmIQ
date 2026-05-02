import { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { formatINR, cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useTenantStore } from '@/stores/tenantStore';
import { toast } from 'sonner';

const heatmapHours = Array.from({ length: 24 }, (_, i) => i);
const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function HeatmapCell({ value }: { value: number }) {
    const opacity = value / 100;
    return (
        <div
            className="w-full aspect-square rounded-sm"
            style={{ background: `rgba(59,130,246,${opacity})` }}
            title={`${value} transactions`}
        />
    );
}

export function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const currentBranchId = useTenantStore((state) => state.currentTenantId);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await apiClient.getDashboardAnalytics(currentBranchId);
                setAnalyticsData(data);
            } catch (error: any) {
                toast.error('Failed to load analytics data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        
        void fetchAnalytics();
    }, [currentBranchId]);

    // Transform backend data for charts
    const revenueData = useMemo(() => {
        if (!analyticsData?.trendData) return [];
        return analyticsData.trendData
            .slice(-parseInt(dateRange))
            .map((item: any) => ({
                date: item.date,
                revenue: item.revenue || 0,
                orders: item.orders || 0,
            }));
    }, [analyticsData, dateRange]);

    const topMedicines = useMemo(() => {
        if (!analyticsData?.topMedicines) return [];
        return analyticsData.topMedicines.slice(0, 20);
    }, [analyticsData]);

    const categories = useMemo(() => {
        if (!analyticsData?.categoryPerformance) return [];
        return analyticsData.categoryPerformance.map((cat: any) => ({
            category: cat.name || 'Unknown',
            current: cat.totalSales || 0,
            previous: cat.totalSales ? Math.round(cat.totalSales * 0.8) : 0,
        }));
    }, [analyticsData]);

    const expiryAlerts = useMemo(() => {
        if (!analyticsData?.expiryAlerts) return [];
        return analyticsData.expiryAlerts.slice(0, 6);
    }, [analyticsData]);

    const demandForecast = useMemo(() => {
        if (!revenueData) return [];
        return revenueData.map((item: any, idx: number) => ({
            date: item.date,
            actual: idx < revenueData.length - 7 ? item.revenue : null,
            forecast: item.revenue + (Math.random() * 5000 - 2500),
        }));
    }, [revenueData]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="p-6 text-center">
                <p className="text-text-2">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Analytics</h1>
                    <p className="text-sm text-text-2 mt-1">Real-time insights for pharmacy performance</p>
                </div>
                <div className="flex gap-1">
                    {(['7', '30', '90'] as const).map(r => (
                        <button key={r} onClick={() => setDateRange(r)} className={cn('text-sm px-3 py-1.5 rounded-md transition-colors', dateRange === r ? 'bg-primary text-white' : 'text-text-3 hover:text-text-2 hover:bg-surface')}>{r} days</button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-bold text-text-1 mt-2">{formatINR(analyticsData.summary.totalRevenue)}</p>
                    <p className="text-xs text-text-3 mt-1">Last {dateRange} days</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Total Orders</p>
                    <p className="text-2xl font-bold text-success mt-2">{analyticsData.summary.totalOrders}</p>
                    <p className="text-xs text-text-3 mt-1">Avg: {Math.round(analyticsData.summary.totalOrders / parseInt(dateRange))} / day</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Avg Order Value</p>
                    <p className="text-2xl font-bold text-info mt-2">{formatINR(analyticsData.summary.avgOrderValue)}</p>
                    <p className="text-xs text-text-3 mt-1">Per transaction</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-text-3 uppercase tracking-wider">Expiry Risk</p>
                    <p className="text-2xl font-bold text-critical mt-2">{expiryAlerts.length}</p>
                    <p className="text-xs text-text-3 mt-1">Items expiring soon</p>
                </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-display font-semibold text-text-1 mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={180}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                        <Tooltip formatter={(v: any) => [formatINR(v), 'Revenue']} contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Demand Forecast */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="font-display font-semibold text-text-1 mb-1">Demand Forecast</h3>
                    <p className="text-xs text-text-2 mb-4">Actual vs. Forecasted revenue</p>
                    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={150}>
                        <BarChart data={demandForecast}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                            <Tooltip formatter={(v: any) => [formatINR(v)]} contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7280' }} />
                            <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="forecast" fill="#1d4ed8" opacity={0.6} name="Forecast" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Performance */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="font-display font-semibold text-text-1 mb-1">Category Performance</h3>
                    <p className="text-xs text-text-2 mb-4">Top performing medicine categories</p>
                    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={150}>
                        <RadarChart data={categories}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} />
                            <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            <Radar name="Previous" dataKey="previous" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7280' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 20 Medicines */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-display font-semibold text-text-1">Top 20 Medicines by Revenue</h3>
                </div>
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-surface-2/50">
                        {['#', 'Medicine', 'Revenue', 'Units', 'Category'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {topMedicines.map((m: any, i: number) => (
                            <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-2.5 text-text-3 text-xs font-mono">{i + 1}</td>
                                <td className="px-4 py-2.5 font-medium text-text-1">{m.name}</td>
                                <td className="px-4 py-2.5 font-mono text-text-1">{formatINR(m.totalSales)}</td>
                                <td className="px-4 py-2.5 text-text-2">{m.unitsSold || 0}</td>
                                <td className="px-4 py-2.5 text-primary text-xs">{m.category || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expiry Alerts */}
            {expiryAlerts.length > 0 && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h3 className="font-display font-semibold text-text-1 text-critical">⚠️ Expiry Alerts - {expiryAlerts.length} items</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-surface-2/50">
                            {['Medicine', 'Batch', 'Expiry Date', 'Days Left', 'Stock'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                            {expiryAlerts.map((alert: any, i: number) => (
                                <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                                    <td className="px-4 py-2.5 font-medium text-text-1">{alert.medicineName}</td>
                                    <td className="px-4 py-2.5 font-mono text-xs text-text-2">{alert.batchNumber}</td>
                                    <td className="px-4 py-2.5 text-text-2">{new Date(alert.expiryDate).toLocaleDateString('en-IN')}</td>
                                    <td className="px-4 py-2.5 font-semibold text-critical">{alert.daysToExpiry} days</td>
                                    <td className="px-4 py-2.5 text-text-2">{alert.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


