import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingCart, AlertTriangle, Clock, CreditCard, FileText, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react';
import {
  Area, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Pie, PieChart, Cell, Legend, BarChart, LineChart, Line,
} from 'recharts';
import { formatINR } from '@/lib/utils';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useTenantStore } from '@/stores/tenantStore';

const T = {
  bg: '#0a0e1a',
  surface: '#111827',
  border: '#1a2640',
  text1: '#f1f5f9',
  text2: '#94a3b8',
  text3: '#475569',
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#a78bfa',
};

type DashboardPayload = {
  summary: {
    todayRevenue: number;
    todayRevenueDelta: number;
    todayOrders: number;
    lowStockCount: number;
    expiringCount: number;
    pendingPayables: number;
    rxQueue: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalMedicines: number;
    totalBatches: number;
  };
  trendData: Array<{ date: string; revenue: number; orders: number }>;
  topMedicines: Array<{ name: string; revenue: number; units: number }>;
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
  stockAging: Array<{ category: string; healthy: number; expiring3m: number; expiring6m: number; dead: number }>;
  recentTransactions: Array<{
    id: string;
    invoiceNo: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    createdBy: string;
  }>;
  expiryAlerts: Array<{ batchId: string; batchNo: string; medicineName: string; quantity: number; daysLeft: number }>;
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111827', border: '1px solid #1a2640', borderRadius: 10, padding: '10px 14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: 12, color: T.text3, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: 13, color: p.color, fontFamily: 'JetBrains Mono, monospace' }}>
          {p.name === 'revenue' ? formatINR(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

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
      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden', cursor: 'default' }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: glowColor, filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: T.text3, letterSpacing: '0.02em' }}>{label}</p>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '18', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={color} strokeWidth={1.75} />
        </div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: T.text1, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.1, marginBottom: 8, position: 'relative' }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sparkline ? 12 : 0 }}>
        {delta !== undefined && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600, color: isUp ? T.green : T.red, background: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, padding: '2px 7px', borderRadius: 99 }}>
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: T.text3 }}>{sub}</span>}
      </div>
      {sparkline && sparkline.length > 0 && (
        <div style={{ height: 44, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height={44} minWidth={0} minHeight={44}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'success' | 'warning' | 'primary' }) {
  const map = {
    success: { bg: 'rgba(34,197,94,0.1)', fg: T.green, border: 'rgba(34,197,94,0.2)' },
    warning: { bg: 'rgba(245,158,11,0.1)', fg: T.amber, border: 'rgba(245,158,11,0.2)' },
    primary: { bg: 'rgba(59,130,246,0.1)', fg: T.blue, border: 'rgba(59,130,246,0.2)' },
  }[tone];

  return <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 600, background: map.bg, color: map.fg, border: `1px solid ${map.border}` }}>{children}</span>;
}

export function DashboardPage() {
  const currentBranchId = useTenantStore((state) => state.currentTenantId);
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payload = await apiClient.getDashboardAnalytics(currentBranchId);
        setData(payload);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to load dashboard analytics');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentBranchId]);

  const trendData = useMemo(() => {
    if (!data) return [];
    return data.trendData.slice(-trendRange);
  }, [data, trendRange]);

  const revenueSeries = data?.trendData || [];
  const latestRevenue = revenueSeries[revenueSeries.length - 1]?.revenue || 0;
  const previousRevenue = revenueSeries[revenueSeries.length - 2]?.revenue || 1;
  const delta = data?.summary.todayRevenueDelta ?? Math.round(((latestRevenue - previousRevenue) / previousRevenue) * 100);
  const isIdleBranch = !!data && data.summary.todayRevenue === 0 && data.summary.todayOrders === 0 && data.summary.lowStockCount === 0 && data.summary.rxQueue === 0;

  const loadingText = loading ? '...' : '0';

  return (
    <div style={{ padding: 24, background: T.bg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text1, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>Live metrics backed by tenant transactions, invoices, batches, and customers</p>
      </div>

      {isIdleBranch && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.border}`, background: 'rgba(59,130,246,0.08)', color: T.text2, fontSize: 13 }}>
          This branch has no sales activity for today yet. Historical counts are still available below.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KPICard index={0} icon={TrendingUp} label="Today's Revenue" value={loading ? loadingText : formatINR(data?.summary.todayRevenue || 0)} delta={delta} sub="vs yesterday" color={T.blue} glowColor="rgba(59,130,246,0.12)" sparkline={revenueSeries.slice(-7).map((d) => d.revenue)} />
        <KPICard index={1} icon={ShoppingCart} label="Today's Orders" value={loading ? loadingText : String(data?.summary.todayOrders || 0)} sub={`${data?.summary.totalCustomers || 0} customers`} color="#38bdf8" glowColor="rgba(56,189,248,0.1)" sparkline={revenueSeries.slice(-7).map((d) => d.orders)} />
        <KPICard index={2} icon={AlertTriangle} label="Low Stock" value={loading ? loadingText : String(data?.summary.lowStockCount || 0)} sub="medicines" color={T.amber} glowColor="rgba(245,158,11,0.1)" />
        <KPICard index={3} icon={Clock} label="Expiry Alerts" value={loading ? loadingText : String(data?.summary.expiringCount || 0)} sub="≤30 days" color={T.red} glowColor="rgba(239,68,68,0.1)" />
        <KPICard index={4} icon={CreditCard} label="Pending Payables" value={loading ? loadingText : formatINR(data?.summary.pendingPayables || 0)} sub={`${data?.summary.totalSuppliers || 0} suppliers`} color={T.amber} glowColor="rgba(245,158,11,0.1)" />
        <KPICard index={5} icon={FileText} label="Rx Queue" value={loading ? loadingText : String(data?.summary.rxQueue || 0)} sub="linked sales" color={T.purple} glowColor="rgba(167,139,250,0.1)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionHeader
            title="Sales Trend"
            subtitle="Revenue (area) + Orders (bars)"
            action={
              <div style={{ display: 'flex', gap: 4 }}>
                {([7, 30, 90] as const).map((r) => (
                  <button key={r} onClick={() => setTrendRange(r)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', background: trendRange === r ? T.blue : 'rgba(255,255,255,0.05)', color: trendRange === r ? 'white' : T.text3, border: `1px solid ${trendRange === r ? T.blue : T.border}` }}>{r}d</button>
                ))}
              </div>
            }
          />
          <div style={{ padding: '0 22px 22px' }}>
            <ResponsiveContainer width="100%" height={230} minWidth={0} minHeight={180}>
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: T.text3, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                <Bar yAxisId="right" dataKey="orders" fill="#22c55e" opacity={0.7} radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Top Medicines" subtitle="By revenue · backed by transactions" />
          <div style={{ padding: '0 22px 22px' }}>
            <ResponsiveContainer width="100%" height={230} minWidth={0} minHeight={180}>
              <BarChart data={data?.topMedicines.slice(0, 6) || []} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: T.text3, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: T.text2, fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(v: any) => [formatINR(v), 'Revenue']} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} labelStyle={{ color: T.text1 }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {(data?.topMedicines.slice(0, 6) || []).map((_, i) => <Cell key={i} fill={`rgba(59,130,246,${1 - i * 0.13})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionHeader title="Category Breakdown" subtitle="Revenue share · from sold items" />
          <div style={{ padding: '0 22px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="45%" height={190} minWidth={140} minHeight={160}>
              <PieChart>
                <Pie data={data?.categoryBreakdown || []} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" strokeWidth={0} paddingAngle={2}>
                  {(data?.categoryBreakdown || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [formatINR(v)]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data?.categoryBreakdown || []).map((e) => {
                const total = (data?.categoryBreakdown || []).reduce((a, c) => a + c.value, 0) || 1;
                const pct = Math.round((e.value / total) * 100);
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
                      <div style={{ height: 3, borderRadius: 99, background: e.color, width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Stock Aging" subtitle="Units by expiry bracket" />
          <div style={{ padding: '0 22px 22px' }}>
            <ResponsiveContainer width="100%" height={190} minWidth={0} minHeight={150}>
              <BarChart data={data?.stockAging || []}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16 }}>
        <Card>
          <SectionHeader title="Recent Transactions" subtitle="Latest billing activity from POS" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['Invoice', 'Patient', 'Amount', 'Payment', 'Time'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 22px 10px', fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions || []).map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: i < 7 ? `1px solid rgba(26,38,64,0.6)` : 'none' }}>
                    <td style={{ padding: '11px 22px' }}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: T.blue }}>{tx.invoiceNo}</span></td>
                    <td style={{ padding: '11px 22px', color: T.text2 }}>{tx.customerName}</td>
                    <td style={{ padding: '11px 22px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.text1 }}>{formatINR(tx.amount)}</td>
                    <td style={{ padding: '11px 22px' }}>
                      <Badge tone={tx.paymentMethod === 'CASH' ? 'success' : tx.paymentMethod === 'UPI' ? 'primary' : 'warning'}>{tx.paymentMethod}</Badge>
                    </td>
                    <td style={{ padding: '11px 22px', fontSize: 11, color: T.text3 }}>{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
                {!loading && (data?.recentTransactions || []).length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '18px 22px', color: T.text3 }}>No transactions found yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Expiry Alerts" subtitle="Critical stock aging" />
          <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data?.expiryAlerts || []).map((row) => (
              <div key={row.batchId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: row.daysLeft < 0 ? 'rgba(239,68,68,0.06)' : row.daysLeft <= 30 ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)', border: `1px solid ${row.daysLeft < 0 ? 'rgba(239,68,68,0.2)' : row.daysLeft <= 30 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.medicineName}</p>
                  <p style={{ fontSize: 11, color: T.text3, fontFamily: 'JetBrains Mono, monospace' }}>{row.batchNo} · {row.quantity} units</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: row.daysLeft < 0 ? T.red : T.amber, background: row.daysLeft < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${row.daysLeft < 0 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                  {row.daysLeft < 0 ? `${Math.abs(row.daysLeft)}d ago` : `${row.daysLeft}d left`}
                </span>
              </div>
            ))}
            {!loading && (data?.expiryAlerts || []).length === 0 && <p style={{ padding: '0 2px', color: T.text3 }}>No expiry alerts right now</p>}
          </div>
        </Card>
      </div>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(17,24,39,0.92)', color: T.text2, border: `1px solid ${T.border}` }}>
            <Loader2 className="w-4 h-4 animate-spin" /> Loading analytics
          </div>
        </div>
      )}
    </div>
  );
}
