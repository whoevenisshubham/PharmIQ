import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingCart, Package, Package2, ArrowLeftRight,
    Truck, Users, FileText, BarChart3, ClipboardList, Shield, Settings,
    ChevronLeft, ChevronRight, Scan, History, PillIcon
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const NAV = [
    {
        section: 'MAIN',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'POS Billing', href: '/pos', icon: ShoppingCart, accent: true },
        ],
    },
    {
        section: 'INVENTORY',
        items: [
            { label: 'Stock', href: '/inventory', icon: Package },
            { label: 'Batch Explorer', href: '/inventory/batches', icon: Package2 },
            { label: 'Transfer', href: '/inventory/transfer', icon: ArrowLeftRight },
        ],
    },
    {
        section: 'PROCUREMENT',
        items: [
            { label: 'OCR Scanner', href: '/purchases/ocr', icon: Scan },
            { label: 'History', href: '/purchases/history', icon: History },
            { label: 'Suppliers', href: '/suppliers', icon: Truck },
        ],
    },
    {
        section: 'CRM',
        items: [
            { label: 'Customers', href: '/customers', icon: Users },
            { label: 'Prescriptions', href: '/prescriptions', icon: FileText },
        ],
    },
    {
        section: 'INTELLIGENCE',
        items: [
            { label: 'Analytics', href: '/analytics', icon: BarChart3 },
            { label: 'Reports', href: '/reports', icon: ClipboardList },
            { label: 'Compliance', href: '/compliance', icon: Shield },
            { label: 'Settings', href: '/settings', icon: Settings },
        ],
    },
];

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUiStore();
    const location = useLocation();

    return (
        <motion.aside
            animate={{ width: sidebarCollapsed ? 56 : 220 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{
                background: '#0d1424',
                borderRight: '1px solid #1a2640',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: sidebarCollapsed ? '16px 12px' : '16px 18px',
                borderBottom: '1px solid #1a2640',
                minHeight: 56,
            }}>
                <div style={{
                    width: 32, height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 20px rgba(59,130,246,0.3)',
                }}>
                    <PillIcon size={16} color="white" />
                </div>
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden' }}
                        >
                            PharmIQ++
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {NAV.map(group => (
                    <div key={group.section} style={{ marginBottom: 4 }}>
                        {!sidebarCollapsed && (
                            <p style={{
                                fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                                color: '#304060', padding: '10px 18px 4px',
                                userSelect: 'none',
                            }}>
                                {group.section}
                            </p>
                        )}
                        {group.items.map(item => {
                            const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        margin: '1px 8px',
                                        padding: sidebarCollapsed ? '9px 8px' : '9px 10px',
                                        borderRadius: 8,
                                        textDecoration: 'none',
                                        transition: 'all 0.15s',
                                        position: 'relative',
                                        background: active
                                            ? item.accent
                                                ? 'rgba(59,130,246,0.2)'
                                                : 'rgba(255,255,255,0.06)'
                                            : 'transparent',
                                        ...(active && {
                                            boxShadow: item.accent ? '0 0 12px rgba(59,130,246,0.15)' : 'none',
                                        }),
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    }}
                                >
                                    {active && (
                                        <span style={{
                                            position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                                            width: 3, height: 18, borderRadius: 2,
                                            background: item.accent ? '#3b82f6' : '#3b82f6',
                                        }} />
                                    )}
                                    <Icon
                                        size={16}
                                        strokeWidth={1.75}
                                        color={active ? (item.accent ? '#60a5fa' : '#93c5fd') : '#4b6080'}
                                        style={{ flexShrink: 0 }}
                                    />
                                    <AnimatePresence>
                                        {!sidebarCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.12 }}
                                                style={{
                                                    fontSize: 13, fontWeight: active ? 600 : 400,
                                                    color: active ? '#f1f5f9' : '#64748b',
                                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                                }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Collapse button */}
            <div style={{ padding: '12px 8px', borderTop: '1px solid #1a2640' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '8px', borderRadius: 8, background: 'transparent', border: 'none',
                        cursor: 'pointer', color: '#304060', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#304060'; }}
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
                            <ChevronLeft size={14} /> Collapse
                        </div>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
