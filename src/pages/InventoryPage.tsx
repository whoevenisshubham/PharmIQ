import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, ColumnDef, flexRender } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Plus, ChevronUp, ChevronDown, X, Eye, Edit, Ban } from 'lucide-react';
import { mockMedicines, mockBatches, mockSuppliers } from '@/data/mock';
import { Medicine, Batch } from '@/types';
import { getExpiryStatus, daysUntilExpiry } from '@/lib/fefo';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { BatchStatusBadge, ScheduleBadge } from '@/components/common/Badge';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useUiStore } from '@/stores/uiStore';

interface FlatInventoryRow {
    medicine: Medicine;
    batch: Batch;
    supplierName: string;
}

export function InventoryPage() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedBatch, setSelectedBatch] = useState<FlatInventoryRow | null>(null);
    const [isLoading] = useState(false);
    const { tableDensity } = useUiStore();

    const flatData = useMemo<FlatInventoryRow[]>(() => {
        return mockBatches
            .filter(b => {
                if (statusFilter === 'expired') return b.status === 'Expired' || new Date(b.expiryDate) < new Date();
                if (statusFilter === 'near_expiry') {
                    const d = daysUntilExpiry(b.expiryDate);
                    return d <= 30 && d >= 0;
                }
                if (statusFilter === 'low_stock') {
                    const med = mockMedicines.find(m => m.id === b.medicineId);
                    return med && b.quantity <= med.reorderPoint;
                }
                if (statusFilter === 'blocked') return b.status === 'Blocked';
                return true;
            })
            .map(batch => {
                const medicine = mockMedicines.find(m => m.id === batch.medicineId)!;
                const supplier = mockSuppliers.find(s => s.id === batch.supplierId);
                return { medicine, batch, supplierName: supplier?.name ?? 'Unknown' };
            })
            .filter(row => {
                if (categoryFilter !== 'all') return row.medicine.category === categoryFilter;
                return true;
            });
    }, [statusFilter, categoryFilter]);

    const categories = Array.from(new Set(mockMedicines.map(m => m.category)));

    const columns = useMemo<ColumnDef<FlatInventoryRow>[]>(() => [
        {
            id: 'medicineName',
            header: 'Medicine',
            accessorFn: row => row.medicine.brandName,
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-text-1">{row.original.medicine.brandName}</p>
                    <p className="text-xs text-text-3">{row.original.medicine.manufacturer}</p>
                </div>
            ),
        },
        {
            id: 'generic',
            header: 'Generic (Molecule)',
            accessorFn: row => row.medicine.genericName,
            cell: ({ row }) => <span className="text-text-2 text-sm">{row.original.medicine.genericName}</span>,
        },
        {
            id: 'category',
            header: 'Category',
            accessorFn: row => row.medicine.category,
            cell: ({ row }) => (
                <span className="text-xs bg-surface-2 px-2 py-0.5 rounded-full text-text-2">{row.original.medicine.category}</span>
            ),
        },
        {
            id: 'batchNo',
            header: 'Batch No',
            accessorFn: row => row.batch.batchNo,
            cell: ({ row }) => <span className="font-mono text-xs text-text-2">{row.original.batch.batchNo}</span>,
        },
        {
            id: 'expiry',
            header: 'Expiry',
            accessorFn: row => row.batch.expiryDate,
            cell: ({ row }) => {
                const status = getExpiryStatus(row.original.batch.expiryDate);
                const days = daysUntilExpiry(row.original.batch.expiryDate);
                return (
                    <div>
                        <p className={cn(
                            'text-sm font-medium',
                            status === 'expired' ? 'text-critical' :
                                status === 'critical' ? 'text-critical' :
                                    status === 'warning' ? 'text-warning' : 'text-text-1'
                        )}>
                            {formatDate(row.original.batch.expiryDate)}
                        </p>
                        <p className="text-xs text-text-3">
                            {days < 0 ? `${Math.abs(days)}d expired` : `${days}d left`}
                        </p>
                    </div>
                );
            },
        },
        {
            id: 'qty',
            header: 'Qty',
            accessorFn: row => row.batch.quantity,
            cell: ({ row }) => {
                const qty = row.original.batch.quantity;
                const reorder = row.original.medicine.reorderPoint;
                return (
                    <span className={cn(
                        'font-mono font-semibold',
                        qty === 0 ? 'text-critical' : qty <= reorder ? 'text-warning' : 'text-text-1'
                    )}>
                        {qty}
                    </span>
                );
            },
        },
        {
            id: 'purchaseRate',
            header: 'Purchase ₹',
            accessorFn: row => row.batch.purchaseRate,
            cell: ({ row }) => <span className="font-mono text-sm text-text-2">{formatINR(row.original.batch.purchaseRate)}</span>,
        },
        {
            id: 'mrp',
            header: 'MRP ₹',
            accessorFn: row => row.batch.mrp,
            cell: ({ row }) => <span className="font-mono text-sm font-medium text-text-1">{formatINR(row.original.batch.mrp)}</span>,
        },
        {
            id: 'status',
            header: 'Status',
            accessorFn: row => row.batch.status,
            cell: ({ row }) => <BatchStatusBadge status={row.original.batch.status} />,
        },
        {
            id: 'schedule',
            header: 'Schedule',
            cell: ({ row }) => <ScheduleBadge schedule={row.original.medicine.scheduleType} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setSelectedBatch(row.original)}
                        className="p-1.5 text-text-3 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="View details"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-text-3 hover:text-warning hover:bg-warning/10 rounded transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-text-3 hover:text-critical hover:bg-critical/10 rounded transition-colors" title="Block batch">
                        <Ban className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ], []);

    const table = useReactTable({
        data: useMemo(() =>
            flatData.filter(r =>
                !globalFilter || r.medicine.brandName.toLowerCase().includes(globalFilter.toLowerCase()) ||
                r.medicine.genericName.toLowerCase().includes(globalFilter.toLowerCase()) ||
                r.batch.batchNo.toLowerCase().includes(globalFilter.toLowerCase())
            ), [flatData, globalFilter]
        ),
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 15 } },
    });

    function getRowClass(row: FlatInventoryRow) {
        const status = getExpiryStatus(row.batch.expiryDate);
        if (status === 'expired') return 'row-expired';
        if (status === 'critical') return 'row-near-expiry-30';
        if (status === 'warning') return 'row-near-expiry-90';
        return '';
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text-1">Inventory</h1>
                    <p className="text-sm text-text-2 mt-1">{flatData.length} batches · {mockMedicines.length} medicines</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => import('sonner').then(m => m.toast.info('Import from CSV', { description: 'This feature will be integrated with the backend Bulk Import API.' }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 text-sm transition-colors"
                    >
                        <Download className="w-4 h-4" /> Import CSV
                    </button>
                    <button
                        onClick={() => import('sonner').then(m => m.toast.success('Add Medicine Form', { description: 'Opening the master data creation form.' }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Medicine
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
                    <input
                        type="text"
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search by name, molecule, or batch..."
                        className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-1 placeholder-text-3 focus:border-primary outline-none transition-colors"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="expired">🔴 Expired</option>
                    <option value="near_expiry">🟡 Near Expiry (≤30d)</option>
                    <option value="low_stock">🟠 Low Stock</option>
                    <option value="blocked">⛔ Blocked</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {(globalFilter || statusFilter !== 'all' || categoryFilter !== 'all') && (
                    <button
                        onClick={() => { setGlobalFilter(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                        className="px-3 py-2 rounded-lg text-text-3 hover:text-text-2 hover:bg-surface-2 text-sm flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}

                {/* Legend */}
                <div className="ml-auto flex items-center gap-3 text-xs text-text-3">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-critical bg-critical/5" /> Expired</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-critical/60 bg-critical/5" /> ≤30d</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-l-2 border-warning/60 bg-warning/5" /> ≤90d</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {isLoading ? <TableSkeleton rows={10} cols={8} /> : (
                    <div className="overflow-x-auto">
                        <table className={cn('w-full text-sm', `density-${tableDensity}`)}>
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id} className="border-b border-border bg-surface-2/50">
                                        {hg.headers.map(header => (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="text-left px-4 py-2.5 text-xs font-semibold text-text-3 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-text-2 select-none"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === 'asc' ? <ChevronUp className="w-3 h-3" /> :
                                                        header.column.getIsSorted() === 'desc' ? <ChevronDown className="w-3 h-3" /> : null}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-border">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className={cn('hover:bg-surface-2/30 transition-colors', getRowClass(row.original))}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-4 py-2.5 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <span className="text-xs text-text-3">
                        {table.getFilteredRowModel().rows.length} results · Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 text-xs rounded border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 disabled:opacity-40 transition-colors">Previous</button>
                        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 text-xs rounded border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 disabled:opacity-40 transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Batch Detail Drawer */}
            <AnimatePresence>
                {selectedBatch && (
                    <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedBatch(null)}>
                        <div className="absolute inset-0 bg-black/40" />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.2 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-96 h-full bg-surface border-l border-border shadow-2xl overflow-y-auto"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface">
                                <h3 className="font-display font-semibold text-text-1">Batch Details</h3>
                                <button onClick={() => setSelectedBatch(null)} className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-5 space-y-5">
                                <div>
                                    <h4 className="font-semibold text-text-1 text-lg">{selectedBatch.medicine.brandName}</h4>
                                    <p className="text-text-3 text-sm">{selectedBatch.medicine.genericName}</p>
                                    <div className="flex gap-2 mt-2">
                                        <ScheduleBadge schedule={selectedBatch.medicine.scheduleType} />
                                        <BatchStatusBadge status={selectedBatch.batch.status} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {[
                                        ['Batch No', selectedBatch.batch.batchNo, true],
                                        ['Expiry Date', formatDate(selectedBatch.batch.expiryDate), false],
                                        ['Mfg Date', formatDate(selectedBatch.batch.manufacturingDate), false],
                                        ['Quantity', String(selectedBatch.batch.quantity), false],
                                        ['Purchase Rate', formatINR(selectedBatch.batch.purchaseRate), true],
                                        ['MRP', formatINR(selectedBatch.batch.mrp), true],
                                        ['Margin', `${Math.round((1 - selectedBatch.batch.purchaseRate / selectedBatch.batch.mrp) * 100)}%`, false],
                                        ['Supplier', selectedBatch.supplierName, false],
                                        ['Category', selectedBatch.medicine.category, false],
                                        ['Pack Size', selectedBatch.medicine.packSize, false],
                                        ['HSN Code', selectedBatch.medicine.hsnCode, true],
                                        ['GST Rate', `${selectedBatch.medicine.gstRate}%`, false],
                                    ].map(([label, value, mono]) => (
                                        <div key={label as string} className="bg-surface-2 rounded-lg p-3">
                                            <p className="text-xs text-text-3 mb-1">{label}</p>
                                            <p className={cn('text-text-1 font-medium', mono ? 'font-mono text-xs' : 'text-sm')}>{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg border border-warning/30 text-warning text-sm hover:bg-warning/5 transition-colors">
                                        Edit Batch
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg border border-critical/30 text-critical text-sm hover:bg-critical/5 transition-colors">
                                        Block Batch
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
