import { CartItem, CartTotals, Customer, Medicine, Batch, Prescription } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PosStore {
    cart: CartItem[];
    activePatient: Customer | null;
    discount: { type: 'flat' | 'percent'; value: number };
    prescriptions: Record<string, Prescription>;
    paymentOpen: boolean;
    addItem: (medicine: Medicine, batch: Batch, qty: number) => void;
    removeItem: (batchId: string) => void;
    updateQty: (batchId: string, qty: number) => void;
    clearCart: () => void;
    setActivePatient: (customer: Customer | null) => void;
    applyDiscount: (discount: { type: 'flat' | 'percent'; value: number }) => void;
    linkPrescription: (medicineId: string, prescription: Prescription) => void;
    computedTotal: () => CartTotals;
    setPaymentOpen: (open: boolean) => void;
    undoLastAction: () => void;
    _previousCart: CartItem[];
}

export const usePosStore = create<PosStore>()(
    devtools(
        (set, get) => ({
            cart: [],
            activePatient: null,
            discount: { type: 'flat', value: 0 },
            prescriptions: {},
            paymentOpen: false,
            _previousCart: [],

            addItem: (medicine, batch, qty) => {
                const { cart } = get();
                const existing = cart.find((item) => item.batch.id === batch.id);
                const newCart = existing
                    ? cart.map((item) =>
                        item.batch.id === batch.id
                            ? {
                                ...item,
                                quantity: item.quantity + qty,
                                subtotal: (item.quantity + qty) * item.unitPrice,
                            }
                            : item
                    )
                    : [
                        ...cart,
                        {
                            medicine,
                            batch,
                            quantity: qty,
                            unitPrice: batch.mrp,
                            discount: 0,
                            subtotal: qty * batch.mrp,
                        },
                    ];
                set({ _previousCart: cart, cart: newCart });
            },

            removeItem: (batchId) => {
                const { cart } = get();
                set({ _previousCart: cart, cart: cart.filter((i) => i.batch.id !== batchId) });
            },

            updateQty: (batchId, qty) => {
                if (qty <= 0) {
                    get().removeItem(batchId);
                    return;
                }
                const { cart } = get();
                set({
                    _previousCart: cart,
                    cart: cart.map((item) =>
                        item.batch.id === batchId
                            ? { ...item, quantity: qty, subtotal: qty * item.unitPrice }
                            : item
                    ),
                });
            },

            clearCart: () => {
                set({ cart: [], discount: { type: 'flat', value: 0 }, prescriptions: {}, activePatient: null, paymentOpen: false });
            },

            setActivePatient: (customer) => set({ activePatient: customer }),

            applyDiscount: (discount) => set({ discount }),

            linkPrescription: (medicineId, prescription) => {
                set((state) => ({
                    prescriptions: { ...state.prescriptions, [medicineId]: prescription },
                    cart: state.cart.map((item) =>
                        item.medicine.id === medicineId
                            ? { ...item, prescriptionId: prescription.id }
                            : item
                    ),
                }));
            },

            computedTotal: () => {
                const { cart, discount } = get();
                const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
                const gst = cart.reduce((acc, item) => {
                    const itemTotal = item.subtotal;
                    const rate = item.medicine.gstRate / 100;
                    return acc + itemTotal * rate;
                }, 0);
                const discountAmt =
                    discount.type === 'flat'
                        ? discount.value
                        : (subtotal * discount.value) / 100;
                const grand = subtotal + gst - discountAmt;
                return { subtotal, gst, discount: discountAmt, grand };
            },

            setPaymentOpen: (open) => set({ paymentOpen: open }),

            undoLastAction: () => {
                const { _previousCart } = get();
                set({ cart: _previousCart });
            },
        }),
        { name: 'pos-store' }
    )
);
