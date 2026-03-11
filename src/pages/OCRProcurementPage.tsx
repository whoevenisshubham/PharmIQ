import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Check, AlertTriangle, AlertCircle, Plus, Trash2, Save } from 'lucide-react';
import { mockOCRInvoices } from '@/data/mock';
import { OCRLineItem } from '@/types';
import { formatINR, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

function ConfidenceBadge({ confidence }: { confidence: number }) {
    if (confidence >= 95) return <span className="text-xs text-success">✓ {confidence}%</span>;
    if (confidence >= 75) return (
        <span className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="w-3 h-3" /> {confidence}%
        </span>
    );
    return (
        <span className="flex items-center gap-1 text-xs text-critical">
            <AlertCircle className="w-3 h-3" /> {confidence}% <span className="font-medium">Verify</span>
        </span>
    );
}

function getConfidenceClass(confidence: number) {
    if (confidence >= 95) return '';
    if (confidence >= 75) return 'confidence-medium';
    return 'confidence-low';
}

export function OCRProcurementPage() {
    const [invoice, setInvoice] = useState(mockOCRInvoices[0]);
    const [items, setItems] = useState<OCRLineItem[]>(invoice.lineItems);
    const [zoom, setZoom] = useState(1);
    const [page, setPage] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [hasFile, setHasFile] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateItem = (id: string, field: keyof OCRLineItem, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const addRow = () => {
        const newItem: OCRLineItem = {
            id: `LI${Date.now()}`,
            rawText: '',
            batchNo: '',
            expiryDate: '',
            quantity: 0,
            unitRate: 0,
            gstRate: 12,
            confidence: 100,
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setHasFile(true);
        toast.info('File uploaded — processing OCR...', { duration: 2000 });
    };

    const handleConfirmAll = () => {
        const ocrItemSchema = z.object({
            batchNo: z.string().min(2),
            expiryDate: z.string().refine((d) => new Date(d) > new Date()),
            quantity: z.number().int().positive(),
            unitRate: z.number().positive(),
            gstRate: z.number()
        });
        const result = z.array(ocrItemSchema).safeParse(items);

        if (!result.success) {
            toast.error(`Validation failed. Please check required fields and expiry dates.`);
            return;
        }
        toast.success(`${items.length} items confirmed — ${items.length} batches added, 0 new medicines created`);
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-bg">
            {/* Left: Document Viewer */}
            <div className="w-[45%] flex flex-col border-r border-border">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="font-display font-semibold text-text-1">Document Viewer</h2>
                        <p className="text-xs text-text-2">Invoice: {invoice.invoiceNo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 rounded text-text-3 hover:text-text-1 hover:bg-surface-2">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-text-3 font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 rounded text-text-3 hover:text-text-1 hover:bg-surface-2">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {!hasFile ? (
                        <div
                            className={cn(
                                'h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer',
                                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            )}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-text-3 mb-4" />
                            <p className="text-text-2 font-medium">Drop invoice here</p>
                            <p className="text-text-3 text-sm mt-1">PDF, JPG, PNG supported</p>
                            <p className="text-text-3 text-xs mt-2">or click to browse</p>
                            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => { setHasFile(true); toast.info('Processing OCR...'); }} />
                        </div>
                    ) : (
                        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                            <img
                                src={invoice.rawImageUrl}
                                alt="Invoice preview"
                                className="w-full rounded-lg border border-border shadow-lg"
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded text-text-3 hover:text-text-1 disabled:opacity-40">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-text-3">Page {page} of 2</span>
                                <button onClick={() => setPage(p => Math.min(2, p + 1))} disabled={page >= 2} className="p-1.5 rounded text-text-3 hover:text-text-1 disabled:opacity-40">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: OCR Data Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex-shrink-0">
                    <h2 className="font-display font-semibold text-text-1">Extracted Data</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> 2 high confidence</span>
                        <span className="text-xs text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 2 medium</span>
                        <span className="text-xs text-critical flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 1 needs review</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Header Fields */}
                    <div className="bg-surface border border-border rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-text-2 mb-3 uppercase tracking-wider">Invoice Header</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Supplier Name', value: invoice.supplierName, confidence: 98 },
                                { label: 'Supplier GSTIN', value: invoice.supplierGstin, confidence: 98 },
                                { label: 'Invoice Number', value: invoice.invoiceNo, confidence: 95 },
                                { label: 'Invoice Date', value: formatDate(invoice.invoiceDate), confidence: 92 },
                                { label: 'Total Amount', value: formatINR(invoice.totalAmount), confidence: 88 },
                            ].map(field => (
                                <div key={field.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-text-3">{field.label}</label>
                                        <ConfidenceBadge confidence={field.confidence} />
                                    </div>
                                    <input
                                        defaultValue={field.value}
                                        className={cn(
                                            'w-full bg-surface-2 border rounded-lg px-3 py-2 text-sm text-text-1 focus:border-primary outline-none transition-colors',
                                            getConfidenceClass(field.confidence)
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Batch Entry Grid */}
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider">Line Items ({items.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-2/50 border-b border-border">
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider w-8">#</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Medicine</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Batch No</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Expiry</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Qty</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Rate</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">GST</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Total</th>
                                        <th className="text-left px-3 py-2.5 text-xs text-text-3 font-semibold uppercase tracking-wider">Confidence</th>
                                        <th className="w-8" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {items.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-surface-2/30 transition-colors">
                                            <td className="px-3 py-2 text-text-3 text-xs">{i + 1}</td>
                                            <td className="px-3 py-2">
                                                <div>
                                                    <input
                                                        defaultValue={item.mappedMedicineName || item.rawText}
                                                        className={cn('w-36 bg-surface-2 border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none', getConfidenceClass(item.confidence))}
                                                    />
                                                    {!item.mappedMedicineId && (
                                                        <button className="mt-1 text-xs text-primary hover:underline flex items-center gap-0.5">
                                                            <Plus className="w-3 h-3" /> Create New
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    defaultValue={item.batchNo}
                                                    onChange={e => updateItem(item.id, 'batchNo', e.target.value)}
                                                    className="w-28 font-mono bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="date"
                                                    defaultValue={item.expiryDate}
                                                    onChange={e => updateItem(item.id, 'expiryDate', e.target.value)}
                                                    className="w-32 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    defaultValue={item.quantity}
                                                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                                                    className="w-16 font-mono bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    defaultValue={item.unitRate}
                                                    onChange={e => updateItem(item.id, 'unitRate', parseFloat(e.target.value))}
                                                    className="w-20 font-mono bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    defaultValue={item.gstRate}
                                                    onChange={e => updateItem(item.id, 'gstRate', parseInt(e.target.value))}
                                                    className="w-16 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-1 focus:border-primary outline-none"
                                                >
                                                    <option value={5}>5%</option>
                                                    <option value={12}>12%</option>
                                                    <option value={18}>18%</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="font-mono text-xs text-text-1">{formatINR(item.quantity * item.unitRate * (1 + item.gstRate / 100))}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <ConfidenceBadge confidence={item.confidence} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <button onClick={() => deleteItem(item.id)} className="text-text-3 hover:text-critical transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                            <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                <Plus className="w-4 h-4" /> Add Row
                            </button>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 rounded-lg border border-border text-text-2 hover:text-text-1 text-sm transition-colors">Reset</button>
                                <button onClick={handleConfirmAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-sm font-medium transition-colors">
                                    <Save className="w-4 h-4" /> Confirm All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
