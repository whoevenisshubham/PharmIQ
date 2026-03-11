import { Bell, Plus, Settings, LogOut, User, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/stores/uiStore';
import { useTenantStore } from '@/stores/tenantStore';
import { mockNotifications } from '@/data/mock';
import { NotificationDrawer } from './NotificationDrawer';

const AVATAR_INITIALS = 'RV';

export function Topbar() {
    const queryClient = useQueryClient();
    const { setCommandBarOpen } = useUiStore();
    const { currentTenantId, tenants, switchTenant } = useTenantStore();
    const [showStoreMenu, setShowStoreMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const currentTenant = tenants.find(t => t.id === currentTenantId);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    return (
        <>
            <header style={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 20px',
                background: '#0d1424',
                borderBottom: '1px solid #1a2640',
                flexShrink: 0,
                zIndex: 40,
                position: 'relative',
            }}>
                {/* Store Switcher */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowStoreMenu(s => !s); setShowUserMenu(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid #1a2640',
                            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                            color: '#94a3b8', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, fontWeight: 500,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2d4060'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a2640'; }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                        {currentTenant?.branchName ?? 'Select Branch'}
                        <ChevronDown size={13} />
                    </button>
                    {showStoreMenu && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                            background: '#111827', border: '1px solid #1a2640', borderRadius: 10,
                            padding: 6, minWidth: 220, zIndex: 100,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        }}>
                            {tenants.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        switchTenant(t.id);
                                        queryClient.invalidateQueries();
                                        setShowStoreMenu(false);
                                    }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 10px', borderRadius: 7, background: t.id === currentTenantId ? 'rgba(59,130,246,0.1)' : 'transparent',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.12s',
                                    }}
                                    onMouseEnter={e => { if (t.id !== currentTenantId) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { if (t.id !== currentTenantId) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                >
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', fontFamily: 'IBM Plex Sans, sans-serif' }}>{t.branchName}</p>
                                        <p style={{ fontSize: 11, color: '#4b6080', fontFamily: 'IBM Plex Sans, sans-serif' }}>{t.city}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Global Search Trigger */}
                <button
                    onClick={() => setCommandBarOpen(true)}
                    style={{
                        flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2640',
                        borderRadius: 8, padding: '7px 14px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a2640'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                    <Search size={13} color="#4b6080" />
                    <span style={{ flex: 1, fontSize: 13, color: '#4b6080', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                        Search medicines, invoices, patients...
                    </span>
                    <kbd style={{
                        fontSize: 10, color: '#304060', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #1f2d45', borderRadius: 4, padding: '2px 5px',
                        fontFamily: 'JetBrains Mono, monospace',
                    }}>Ctrl+K</kbd>
                </button>

                <div style={{ flex: 1 }} />

                {/* Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* New Sale */}
                    <a
                        href="/pos"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            borderRadius: 7, padding: '6px 12px', textDecoration: 'none',
                            fontSize: 13, fontWeight: 600, color: 'white',
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)'; }}
                    >
                        <Plus size={14} /> New Sale
                    </a>

                    {/* Notifications */}
                    <button
                        onClick={() => setShowNotifs(true)}
                        style={{
                            position: 'relative', width: 36, height: 36, borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s', color: '#4b6080',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = '#1a2640'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#4b6080'; }}
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                                borderRadius: '50%', background: '#ef4444',
                                boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                                border: '1.5px solid #0d1424',
                            }} />
                        )}
                    </button>

                    {/* User Avatar */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setShowUserMenu(s => !s); setShowStoreMenu(false); }}
                            style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                border: '1.5px solid rgba(59,130,246,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700,
                                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                        >
                            {AVATAR_INITIALS}
                        </button>
                        {showUserMenu && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                background: '#111827', border: '1px solid #1a2640', borderRadius: 10,
                                padding: 6, minWidth: 190, zIndex: 100,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            }}>
                                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #1a2640', marginBottom: 6 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' }}>Ramesh Verma</p>
                                    <p style={{ fontSize: 11, color: '#4b6080' }}>Owner · Pune Main</p>
                                </div>
                                {[
                                    { Icon: User, label: 'Profile', href: '/settings' },
                                    { Icon: Settings, label: 'Settings', href: '/settings' },
                                ].map(({ Icon, label, href }) => (
                                    <a key={label} href={href} onClick={() => setShowUserMenu(false)} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                        borderRadius: 7, textDecoration: 'none', color: '#64748b',
                                        fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif',
                                        transition: 'all 0.12s',
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#f1f5f9'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                                    >
                                        <Icon size={14} /> {label}
                                    </a>
                                ))}
                                <div style={{ borderTop: '1px solid #1a2640', marginTop: 4, paddingTop: 4 }}>
                                    <button style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent',
                                        color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: 'IBM Plex Sans, sans-serif',
                                        transition: 'all 0.12s', textAlign: 'left',
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Click-outside dismissal */}
            {(showStoreMenu || showUserMenu) && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => { setShowStoreMenu(false); setShowUserMenu(false); }} />
            )}

            <NotificationDrawer open={showNotifs} onClose={() => setShowNotifs(false)} />
        </>
    );
}
