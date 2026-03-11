import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, ShoppingCart, AlertTriangle, Clock, CreditCard, FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    Area, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Pie, PieChart, Cell, Legend, BarChart, LineChart, Line
} from 'recharts';
import { formatINR, formatDate } from '@/lib/utils';
import {
    mockSalesTrend, mockCategoryBreakdown, mockTopMedicines,
    mockStockAging, mockSales, mockBatches, mockMedicines
} from '@/data/mock';

// ─── Shared inline style tokens ───
const T = {
    bg: '#0a0e1a',
    surface: '#111827',
    surface2: '#151f2e',
    border: '#1a2640',
    border2: '#1f3050',
    text1: '#f1f5f9',
    text2: '#94a3b8',
    text3: '#475569',
    blue: '#3b82f6',
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
    purple: '#a78bfa',
};

// ─── Custom Tooltip ───
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#111827', border: '1px solid #1a2640', borderRadius: 10,
            padding: '10px 14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
            <p style={{ fontSize: 12, color: T.text3, marginBottom: 6 }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ fontSize: 13, color: p.color, fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.name === 'revenue' ? formatINR(p.value) : `${p.value} orders`}
                </p>
            ))}
        </div>
    );
}

// ─── Card Container ───
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            overflow: 'hidden',
            ...style,
        }}>
            {children}
        </div>
    );
}

// ─── Section Header ───
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px 0', marginBottom: 16 }}>
            <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text1, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

// ─── KPI Card ───
interface KPIProps {
    icon: React.ElementType;
    label: string;
    value: string;
    delta?: number;
    sub?: string;
    color: string;
    glowColor: string;
    sparkline?: number[];
    index?: number;
}

function KPICard({ icon: Icon, label, value, delta, sub, color, glowColor, sparkline, index = 0 }: KPIProps) {
    const sparkData = (sparkline ?? []).map((v, i) => ({ v, i }));
    const isUp = delta !== undefined && delta >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: '20px 22px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e: any) => {
                e.currentTarget.style.borderColor = color + '30';
                e.currentTarget.style.boxShadow = `0 8px 32px ${glowColor}`;
            }}
            onMouseLeave={(e: any) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Background glow blob */}
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: glowColor, filter: 'blur(24px)', pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: T.text3, letterSpacing: '0.02em' }}>{label}</p>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: color + '18', border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Icon size={16} color={color} strokeWidth={1.75} />
                </div>
            </div>

            <p style={{
                fontSize: 26, fontWeight: 800, color: T.text1,
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.1, marginBottom: 8,
                position: 'relative',
            }}>
                {value}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sparkline ? 12 : 0 }}>
                {delta !== undefined && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        fontSize: 12, fontWeight: 600,
                        color: isUp ? T.green : T.red,
                        background: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isUp ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        padding: '2px 7px', borderRadius: 99,
                    }}>
                        {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(delta)}%
                    </span>
                )}
                {sub && <span style={{ fontSize: 11, color: T.text3 }}>{sub}</span>}
            </div>

            {sparkline && sparkline.length > 0 && (
                <div style={{ height: 44, marginTop: 4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                            <defs>
                                <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}

// ─── Main Dashboard ───
export function DashboardPage() {
    const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);

    const trendData = mockSalesTrend.slice(-trendRange);
    const todayRevenue = mockSalesTrend.at(-1)?.revenue ?? 0;
    const yestRevenue = mockSalesTrend.at(-2)?.revenue ?? 1;
    const revDelta = Math.round(((todayRevenue - yestRevenue) / yestRevenue) * 100);
    const todayOrders = mockSalesTrend.at(-1)?.orders ?? 0;

    const nearExpiry = mockBatches.filter(b => {
        const d = (new Date(b.expiryDate).getTime() - Date.now()) / 86400000;
        return d <= 30 && d >= 0;
    });
    const lowStock = mockMedicines.filter(m => {
        const batch = mockBatches.find(b => b.medicineId === m.id && b.status === 'Available');
        return batch && batch.quantity <= m.reorderPoint;
    });

    const expiryAlerts = mockBatches
        .filter(b => {
            const d = (new Date(b.expiryDate).getTime() - Date.now()) / 86400000;
            return d <= 60;
        })
        .slice(0, 7)
        .map(batch => {
            const med = mockMedicines.find(m => m.id === batch.medicineId);
            const days = Math.round((new Date(batch.expiryDate).getTime() - Date.now()) / 86400000);
            return { batch, med, days };
        });

    return (
        <div style={{ padding: 24, background: T.bg, minHeight: '100%' }}>
            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text1, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>
                    Wednesday, 11 March 2026 &nbsp;·&nbsp; Pune — Main Branch
                </p>
            </div>

            {/* KPI Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                <KPICard index={0} icon={TrendingUp} label="Today's Revenue" value={formatINR(todayRevenue)}
                    delta={revDelta} sub="vs yesterday" color={T.blue} glowColor="rgba(59,130,246,0.12)"
                    sparkline={mockSalesTrend.slice(-7).map(d => d.revenue)} />
                <KPICard index={1} icon={ShoppingCart} label="Today's Orders" value={String(todayOrders)}
                    sub={`${Math.round(todayOrders * 2.1)} items`} color="#38bdf8" glowColor="rgba(56,189,248,0.1)"
                    sparkline={mockSalesTrend.slice(-7).map(d => d.orders)} />
                <KPICard index={2} icon={AlertTriangle} label="Low Stock" value={String(lowStock.length)}
                    sub="medicines" color={T.amber} glowColor="rgba(245,158,11,0.1)" delta={-3} />
                <KPICard index={3} icon={Clock} label="Expiry Alerts" value={String(nearExpiry.length)}
                    sub="≤30 days" color={T.red} glowColor="rgba(239,68,68,0.1)" delta={-8} />
                <KPICard index={4} icon={CreditCard} label="Pending Payables" value="₹1.25L"
                    sub="3 overdue" color={T.amber} glowColor="rgba(245,158,11,0.1)" />
                <KPICard index={5} icon={FileText} label="Rx Queue" value="5"
                    sub="2 urgent" color={T.purple} glowColor="rgba(167,139,250,0.1)" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16, marginBottom: 16 }}>
                {/* Sales Trend */}
                <Card>
                    <SectionHeader
                        title="Sales Trend"
                        subtitle="Revenue (area) + Orders (bars)"
                        action={
                            <div style={{ display: 'flex', gap: 4 }}>
                                {([7, 30, 90] as const).map(r => (
                                    <button key={r} onClick={() => setTrendRange(r)} style={{
                                        fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                        background: trendRange === r ? T.blue : 'rgba(255,255,255,0.05)',
                                        color: trendRange === r ? 'white' : T.text3,
                                        border: `1px solid ${trendRange === r ? T.blue : T.border}`,
                                        transition: 'all 0.15s',
                                    }}>
                                        {r}d
                                    </button>
                                ))}
                            </div>
                        }
                    />
                    <div style={{ padding: '0 22px 22px' }}>
                        <ResponsiveContainer width="100%" height={230}>
                            <ComposedChart data={trendData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                                <Bar yAxisId="right" dataKey="orders" fill="#22c55e" opacity={0.7} radius={[3, 3, 0, 0]} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Medicines */}
                <Card>
                    <SectionHeader title="Top Medicines" subtitle="By revenue · this month" />
                    <div style={{ padding: '0 22px 22px' }}>
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={mockTopMedicines.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis type="number" tick={{ fill: T.text3, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                                <YAxis type="category" dataKey="name" tick={{ fill: T.text2, fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                                <Tooltip formatter={(v: any) => [formatINR(v), 'Revenue']} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} labelStyle={{ color: T.text1 }} />
                                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                                    {mockTopMedicines.slice(0, 6).map((_, i) => (
                                        <Cell key={i} fill={`rgba(59,130,246,${1 - i * 0.13})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Category Breakdown Donut */}
                <Card>
                    <SectionHeader title="Category Breakdown" subtitle="Revenue share · this month" />
                    <div style={{ padding: '0 22px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
                        <ResponsiveContainer width="45%" height={190}>
                            <PieChart>
                                <Pie data={mockCategoryBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" strokeWidth={0} paddingAngle={2}>
                                    {mockCategoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => [formatINR(v)]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {mockCategoryBreakdown.map((e) => {
                                const total = mockCategoryBreakdown.reduce((a, c) => a + c.value, 0);
                                const pct = Math.round(e.value / total * 100);
                                return (
                                    <div key={e.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, color: T.text2 }}>{e.name}</span>
                                            </div>
                                            <span style={{ fontSize: 12, color: T.text1, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
                                        </div>
                                        <div style={{ height: 3, background: T.border, borderRadius: 99 }}>
                                            <div style={{ height: 3, borderRadius: 99, background: e.color, width: `${pct}%`, transition: 'width 0.8s ease-out' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Stock Aging */}
                <Card>
                    <SectionHeader title="Stock Aging" subtitle="Units by expiry bracket" />
                    <div style={{ padding: '0 22px 22px' }}>
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={mockStockAging}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="category" tick={{ fill: T.text3, fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: T.text3, fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} labelStyle={{ color: T.text1 }} />
                                <Legend wrapperStyle={{ fontSize: 10, color: T.text3, paddingTop: 8 }} />
                                <Bar dataKey="healthy" stackId="a" fill="#22c55e" name="Healthy" />
                                <Bar dataKey="expiring3m" stackId="a" fill="#f59e0b" name="≤3 mo" />
                                <Bar dataKey="expiring6m" stackId="a" fill="#f97316" name="≤6 mo" />
                                <Bar dataKey="dead" stackId="a" fill="#ef4444" name="Expired" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16 }}>
                {/* Recent Transactions */}
                <Card>
                    <SectionHeader title="Recent Transactions" subtitle="Latest billing activity" />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                                    {['Invoice', 'Patient', 'Amount', 'Payment', 'Time'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0 22px 10px', fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mockSales.slice(0, 8).map((s, i) => (
                                    <tr key={s.id} style={{ borderBottom: i < 7 ? `1px solid rgba(26,38,64,0.6)` : 'none' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '11px 22px' }}>
                                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: T.blue }}>{s.invoiceNo}</span>
                                        </td>
                                        <td style={{ padding: '11px 22px', color: T.text2 }}>{s.customerName}</td>
                                        <td style={{ padding: '11px 22px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.text1 }}>{formatINR(s.grandTotal)}</td>
                                        <td style={{ padding: '11px 22px' }}>
                                            <span style={{
                                                fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 600,
                                                background: s.paymentMethod === 'Cash' ? 'rgba(34,197,94,0.12)' : s.paymentMethod === 'UPI' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                                                color: s.paymentMethod === 'Cash' ? T.green : s.paymentMethod === 'UPI' ? T.blue : T.amber,
                                                border: `1px solid ${s.paymentMethod === 'Cash' ? 'rgba(34,197,94,0.2)' : s.paymentMethod === 'UPI' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                            }}>
                                                {s.paymentMethod}
                                            </span>
                                        </td>
                                        <td style={{ padding: '11px 22px', fontSize: 11, color: T.text3 }}>
                                            {new Date(s.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Expiry Alerts */}
                <Card style={{ overflow: 'hidden' }}>
                    <SectionHeader title="Expiry Alerts" subtitle="Critical stock aging" />
                    <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {expiryAlerts.map(({ batch, med, days }) => {
                            const isExpired = days < 0;
                            const isCritical = days >= 0 && days <= 30;
                            const color = isExpired || isCritical ? T.red : T.amber;
                            return (
                                <div key={batch.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', borderRadius: 10,
                                    background: isExpired ? 'rgba(239,68,68,0.06)' : isCritical ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
                                    border: `1px solid ${isExpired ? 'rgba(239,68,68,0.2)' : isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: T.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {med?.brandName}
                                        </p>
                                        <p style={{ fontSize: 11, color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>
                                            {batch.batchNo} · {batch.quantity} units
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color,
                                        background: color === T.red ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                        border: `1px solid ${color === T.red ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                                        padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8,
                                    }}>
                                        {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
