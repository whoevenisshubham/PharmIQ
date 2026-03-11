import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, FileText, Users, ArrowRight, X } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { mockMedicines, mockCustomers, mockSales } from '@/data/mock';

interface SearchResult {
    id: string;
    type: 'medicine' | 'invoice' | 'customer' | 'action';
    title: string;
    subtitle: string;
    url?: string;
    icon: React.ElementType;
}

export function GlobalCommandBar() {
    const { setCommandBarOpen } = useUiStore();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setCommandBarOpen(false);
            if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, results.length - 1));
            if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0));
            if (e.key === 'Enter' && results[selected]) {
                handleSelect(results[selected]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selected, query]);

    const q = query.toLowerCase();
    const medicineResults: SearchResult[] = q
        ? mockMedicines
            .filter((m) => m.brandName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q))
            .slice(0, 3)
            .map((m) => ({ id: m.id, type: 'medicine', title: m.brandName, subtitle: m.genericName + ' · ' + m.packSize, url: '/inventory', icon: Package }))
        : [];

    const customerResults: SearchResult[] = q
        ? mockCustomers
            .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
            .slice(0, 3)
            .map((c) => ({ id: c.id, type: 'customer', title: c.name, subtitle: c.phone, url: '/customers', icon: Users }))
        : [];

    const invoiceResults: SearchResult[] = q
        ? mockSales
            .filter((s) => s.invoiceNo.toLowerCase().includes(q) || (s.customerName?.toLowerCase() ?? '').includes(q))
            .slice(0, 2)
            .map((s) => ({ id: s.id, type: 'invoice', title: s.invoiceNo, subtitle: s.customerName + ' · ₹' + s.grandTotal, url: '/reports', icon: FileText }))
        : [];

    const defaultActions: SearchResult[] = [
        { id: 'pos', type: 'action', title: 'Open POS Billing', subtitle: 'Start a new sale', url: '/pos', icon: ArrowRight },
        { id: 'inventory', type: 'action', title: 'View Inventory', subtitle: 'All stock', url: '/inventory', icon: Package },
        { id: 'customers', type: 'action', title: 'Customers', subtitle: 'CRM', url: '/customers', icon: Users },
    ];

    const results = q
        ? [...medicineResults, ...customerResults, ...invoiceResults]
        : defaultActions;

    const handleSelect = (result: SearchResult) => {
        if (result.url) navigate(result.url);
        setCommandBarOpen(false);
    };

    const groupedResults = {
        Medicines: results.filter((r) => r.type === 'medicine'),
        Customers: results.filter((r) => r.type === 'customer'),
        Invoices: results.filter((r) => r.type === 'invoice'),
        Actions: results.filter((r) => r.type === 'action'),
    };

    let globalIdx = 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-24"
                onClick={() => setCommandBarOpen(false)}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -16 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                        <Search className="w-5 h-5 text-text-3 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                            placeholder="Search medicines, invoices, patients..."
                            className="flex-1 bg-transparent text-text-1 placeholder-text-3 outline-none text-sm"
                        />
                        <button onClick={() => setCommandBarOpen(false)} className="text-text-3 hover:text-text-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto py-2">
                        {Object.entries(groupedResults).map(([group, items]) => {
                            if (!items.length) return null;
                            return (
                                <div key={group}>
                                    <p className="text-xs font-medium text-text-3 uppercase tracking-wider px-4 py-1.5">{group}</p>
                                    {items.map((item) => {
                                        const idx = globalIdx++;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelected(idx)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${selected === idx ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                                                    }`}
                                            >
                                                <div className="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-3.5 h-3.5 text-text-2" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-text-1 font-medium truncate">{item.title}</p>
                                                    <p className="text-xs text-text-3 truncate">{item.subtitle}</p>
                                                </div>
                                                {selected === idx && <ArrowRight className="w-4 h-4 text-text-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                        {!results.length && query && (
                            <div className="px-4 py-8 text-center text-text-3 text-sm">
                                No results for &ldquo;{query}&rdquo;
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-text-3">
                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">↵</kbd> Open</span>
                        <span><kbd className="font-mono bg-surface-2 px-1.5 py-0.5 rounded">Esc</kbd> Close</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
