import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { mockSalesTrend, mockTopMedicines, mockCategoryBreakdown } from '@/data/mock';
import { formatINR, cn } from '@/lib/utils';

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

const demandForecast = Array.from({ length: 14 }, (_, i) => ({
    date: `Mar ${12 + i}`,
    actual: i < 7 ? Math.round(15000 + Math.random() * 5000) : null,
    forecast: Math.round(14000 + Math.random() * 7000),
}));

const radarData = [
    { category: 'Cardiac', current: 85, previous: 72 },
    { category: 'Antidiabetic', current: 78, previous: 65 },
    { category: 'Antibiotics', current: 60, previous: 70 },
    { category: 'Vitamins', current: 90, previous: 82 },
    { category: 'Analgesics', current: 95, previous: 88 },
    { category: 'GI', current: 68, previous: 60 },
];

const expiryLossData = Array.from({ length: 6 }, (_, i) => ({
    month: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i],
    loss: Math.round(5000 + Math.random() * 20000),
}));

export function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Analytics</h1>
                    <p className="text-sm text-text-2 mt-1">Long-term insights for pharmacy owners</p>
                </div>
                <div className="flex gap-1">
                    {(['7', '30', '90'] as const).map(r => (
                        <button key={r} onClick={() => setDateRange(r)} className={cn('text-sm px-3 py-1.5 rounded-md transition-colors', dateRange === r ? 'bg-primary text-white' : 'text-text-3 hover:text-text-2 hover:bg-surface')}>{r} days</button>
                    ))}
                </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-display font-semibold text-text-1 mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={mockSalesTrend.slice(-parseInt(dateRange))}>
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
                    <p className="text-xs text-text-2 mb-4">Predicted vs. actual revenue next 14 days</p>
                    <ResponsiveContainer width="100%" height={200}>
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

                {/* Expiry Loss */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="font-display font-semibold text-text-1 mb-1">Expiry Loss Analysis</h3>
                    <p className="text-xs text-text-2 mb-4">₹ value of expired stock per month</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={expiryLossData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                            <Tooltip formatter={(v: any) => [formatINR(v), 'Expiry Loss']} contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                            <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Category Radar */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="font-display font-semibold text-text-1 mb-1">Category Performance</h3>
                    <p className="text-xs text-text-2 mb-4">This month vs last month</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} />
                            <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            <Radar name="Previous" dataKey="previous" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#6b7280' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales Velocity Heatmap */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="font-display font-semibold text-text-1 mb-1">Sales Velocity Heatmap</h3>
                    <p className="text-xs text-text-2 mb-4">Transaction density (Days × Hours)</p>
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-0.5 text-xs text-text-3 justify-around pr-1">
                            {heatmapDays.map(d => <span key={d} className="w-6">{d}</span>)}
                        </div>
                        <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${heatmapHours.length}, 1fr)` }}>
                            {heatmapDays.flatMap((day, di) =>
                                heatmapHours.map(hour => {
                                    const isBusinessHour = hour >= 8 && hour <= 20;
                                    const isMorningPeak = hour >= 9 && hour <= 11;
                                    const isEveningPeak = hour >= 17 && hour <= 19;
                                    const value = isBusinessHour ? (isMorningPeak || isEveningPeak ? 60 + Math.floor(Math.random() * 40) : 20 + Math.floor(Math.random() * 40)) : Math.floor(Math.random() * 15);
                                    return <HeatmapCell key={`${day}-${hour}`} value={value} />;
                                })
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-text-3 mt-2">
                        {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}:00</span>)}
                    </div>
                </div>
            </div>

            {/* Top 20 Medicines */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-display font-semibold text-text-1">Top 20 Medicines</h3>
                </div>
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-surface-2/50">
                        {['#', 'Medicine', 'Revenue', 'Units', 'Avg. Margin'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                        {mockTopMedicines.map((m, i) => (
                            <tr key={m.name} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-2.5 text-text-3 text-xs font-mono">{i + 1}</td>
                                <td className="px-4 py-2.5 font-medium text-text-1">{m.name}</td>
                                <td className="px-4 py-2.5 font-mono text-text-1">{formatINR(m.revenue)}</td>
                                <td className="px-4 py-2.5 text-text-2">{m.units.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-success font-medium">{Math.round(25 + Math.random() * 20)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
