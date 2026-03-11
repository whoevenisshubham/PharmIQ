import { useState } from 'react';
import { mockTenants } from '@/data/mock';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { Store, Users, Shield, Receipt, Pill, Bell, Database, Monitor } from 'lucide-react';
import { TableDensity } from '@/types';

const SETTING_TABS = [
    { id: 'store', label: 'Store Config', icon: Store },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Role Permissions', icon: Shield },
    { id: 'tax', label: 'Tax Config', icon: Receipt },
    { id: 'medicine', label: 'Medicine Master', icon: Pill },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup & Data', icon: Database },
    { id: 'display', label: 'Display', icon: Monitor },
];

const ROLES = ['Owner', 'Pharmacist', 'Staff', 'Auditor'];
const FEATURES = ['POS Billing', 'Inventory Edit', 'Procurement', 'Reports', 'Customer Data', 'Compliance', 'Settings', 'User Mgmt'];
const PERMISSIONS: Record<string, Record<string, boolean>> = {
    Owner: { 'POS Billing': true, 'Inventory Edit': true, 'Procurement': true, 'Reports': true, 'Customer Data': true, 'Compliance': true, 'Settings': true, 'User Mgmt': true },
    Pharmacist: { 'POS Billing': true, 'Inventory Edit': true, 'Procurement': true, 'Reports': true, 'Customer Data': true, 'Compliance': false, 'Settings': false, 'User Mgmt': false },
    Staff: { 'POS Billing': true, 'Inventory Edit': false, 'Procurement': false, 'Reports': false, 'Customer Data': true, 'Compliance': false, 'Settings': false, 'User Mgmt': false },
    Auditor: { 'POS Billing': false, 'Inventory Edit': false, 'Procurement': false, 'Reports': true, 'Customer Data': false, 'Compliance': true, 'Settings': false, 'User Mgmt': false },
};

const MOCK_USERS = [
    { id: 'U001', name: 'Admin Owner', email: 'admin@pharmez.in', role: 'Owner', status: 'Active' },
    { id: 'U002', name: 'Ramesh Pharmacist', email: 'r.pharm@pharmez.in', role: 'Pharmacist', status: 'Active' },
    { id: 'U003', name: 'Seema Staff', email: 's.staff@pharmez.in', role: 'Staff', status: 'Active' },
    { id: 'U004', name: 'Audit Viewer', email: 'audit@pharmez.in', role: 'Auditor', status: 'Active' },
];

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState('display');
    const { tableDensity, setDensity, theme, setTheme } = useUiStore();

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Sidebar */}
            <div className="w-52 border-r border-border bg-surface flex-shrink-0 overflow-y-auto py-3 px-2">
                <p className="text-xs font-medium text-text-3 uppercase tracking-wider px-2 mb-2">Settings</p>
                {SETTING_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors mb-0.5',
                                activeTab === tab.id ? 'bg-surface-2 text-text-1 font-medium' : 'text-text-2 hover:text-text-1 hover:bg-surface-2/50'
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'display' && (
                    <div className="max-w-lg space-y-6">
                        <div>
                            <h2 className="text-xl font-display font-bold text-text-1 mb-1">Display</h2>
                            <p className="text-sm text-text-2">Customize your visual preferences</p>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-text-1 mb-1 block">Table Density</label>
                                <p className="text-xs text-text-3 mb-3">Adjusts padding and font size in all tables</p>
                                <div className="flex gap-2">
                                    {(['compact', 'comfortable'] as TableDensity[]).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDensity(d)}
                                            className={cn(
                                                'flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors capitalize',
                                                tableDensity === d ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-2 hover:text-text-1 hover:border-border/80'
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-1 mb-1 block">Theme</label>
                                <p className="text-xs text-text-3 mb-3">Interface appearance</p>
                                <div className="flex gap-2">
                                    {(['dark', 'light', 'system'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={cn(
                                                'flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors capitalize',
                                                theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-2 hover:text-text-1'
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="max-w-2xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-display font-bold text-text-1 mb-1">User Management</h2>
                            <p className="text-sm text-text-2">Manage team access and roles</p>
                        </div>
                        <div className="flex justify-end mb-4">
                            <button className="px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium">Invite User</button>
                        </div>
                        <div className="bg-surface border border-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border bg-surface-2/50">
                                    {['User', 'Email', 'Role', 'Status', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-3 uppercase tracking-wider">{h}</th>)}
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {MOCK_USERS.map(u => (
                                        <tr key={u.id} className="hover:bg-surface-2/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-primary">{u.name[0]}</span>
                                                    </div>
                                                    <p className="font-medium text-text-1">{u.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-text-2 text-xs">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <select defaultValue={u.role} className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none">
                                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3"><span className="text-xs text-success">● {u.status}</span></td>
                                            <td className="px-4 py-3"><button className="text-xs text-critical hover:underline">Revoke</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="max-w-2xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-display font-bold text-text-1 mb-1">Role Permissions</h2>
                            <p className="text-sm text-text-2">Configure access per role per feature</p>
                        </div>
                        <div className="bg-surface border border-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-border bg-surface-2/50">
                                    <th className="text-left px-4 py-3 text-xs text-text-3 font-semibold uppercase tracking-wider">Feature</th>
                                    {ROLES.map(r => <th key={r} className="text-center px-4 py-3 text-xs text-text-3 font-semibold uppercase tracking-wider">{r}</th>)}
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {FEATURES.map(feature => (
                                        <tr key={feature} className="hover:bg-surface-2/30 transition-colors">
                                            <td className="px-4 py-2.5 text-text-1">{feature}</td>
                                            {ROLES.map(role => (
                                                <td key={role} className="px-4 py-2.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={PERMISSIONS[role]?.[feature]}
                                                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'store' && (
                    <div className="max-w-lg">
                        <h2 className="text-xl font-display font-bold text-text-1 mb-1">Store Configuration</h2>
                        <p className="text-sm text-text-2 mb-6">Branch-level settings and drug license information</p>
                        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                            {[
                                ['Store Name', 'PharmEZ'], ['Branch Name', 'Pune - Main Branch'],
                                ['Address', '12, FC Road, Deccan, Pune 411004'], ['GSTIN', '27AADCB2230M1ZT'],
                                ['Drug License No', 'MH-PUN-2021-0042'], ['Phone', '9876543210'],
                                ['Email', 'pune.main@pharmez.in'],
                            ].map(([l, v]) => (
                                <div key={l}>
                                    <label className="text-xs text-text-3 mb-1 block">{l}</label>
                                    <input defaultValue={v} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none transition-colors" />
                                </div>
                            ))}
                            <button className="w-full py-2.5 bg-primary hover:bg-primary-dim text-white rounded-lg text-sm font-medium transition-colors">Save Changes</button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-lg">
                        <h2 className="text-xl font-display font-bold text-text-1 mb-1">Notification Rules</h2>
                        <p className="text-sm text-text-2 mb-6">Set thresholds for alerts</p>
                        <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
                            {[
                                ['Low Stock Alert (days of supply)', '7'],
                                ['Expiry Warning (days before)', '30'],
                                ['Near Expiry Secondary Warning (days)', '90'],
                            ].map(([l, v]) => (
                                <div key={l} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-1 font-medium">{l}</p>
                                    </div>
                                    <input type="number" defaultValue={v} className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-sm text-text-1 focus:border-primary outline-none text-right font-mono" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(activeTab === 'tax' || activeTab === 'medicine' || activeTab === 'backup') && (
                    <div className="max-w-lg">
                        <h2 className="text-xl font-display font-bold text-text-1 mb-2 capitalize">
                            {SETTING_TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-sm text-text-2 mb-6">Configuration options for this section</p>
                        <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-text-2 font-medium">Coming Soon</p>
                            <p className="text-text-3 text-sm mt-1">This section is under active development</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
