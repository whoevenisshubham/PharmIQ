import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Batch, CartItem, Customer, Medicine, Supplier } from '@/types';
import { apiClient } from '@/api/client';

type BranchStock = {
  medicines: Medicine[];
  batches: Batch[];
  suppliers: Supplier[];
  customers: Customer[];
};

type NewMedicineInput = {
  brandName: string;
  genericName: string;
  category: string;
  packSize: string;
  manufacturer: string;
  hsnCode: string;
  gstRate: 5 | 12 | 18;
  scheduleType: Medicine['scheduleType'];
  reorderPoint: number;
  batchNo: string;
  expiryDate: string;
  manufacturingDate: string;
  quantity: number;
  purchaseRate: number;
  mrp: number;
  supplierId: string;
};

type TransferLine = {
  medicineId: string;
  quantity: number;
};

type ImportResult = {
  medicinesCreated: number;
  batchesCreated: number;
  errors: string[];
};

type BranchInventorySnapshot = BranchStock & { branch?: { id: string } };

interface BranchInventoryState {
  branches: Record<string, BranchStock>;
  initializedFor: string[];
  initializeBranches: (branchIds: string[]) => Promise<void>;
  addMedicineWithBatch: (branchId: string, input: NewMedicineInput) => Promise<void>;
  importCsv: (branchId: string, csvText: string) => Promise<ImportResult>;
  applySale: (branchId: string, cart: CartItem[]) => Promise<{ success: boolean; error?: string }>;
  transferStock: (sourceBranchId: string, destinationBranchId: string, lines: TransferLine[]) => Promise<{ success: boolean; moved: number; error?: string }>;
  toggleBatchBlocked: (branchId: string, batchId: string) => Promise<void>;
}

const toBranchStock = (snapshot: BranchInventorySnapshot): BranchStock => snapshot;

export const useBranchInventoryStore = create<BranchInventoryState>()(
  persist(
    (set, get) => ({
      branches: {},
      initializedFor: [],

      initializeBranches: async (branchIds) => {
        if (branchIds.length === 0) return;

        const snapshots = await Promise.all(
          branchIds.map(async (branchId) => ({ branchId, data: await apiClient.getBranchInventory(branchId) }))
        );

        const branches: Record<string, BranchStock> = { ...get().branches };
        snapshots.forEach(({ branchId, data }) => {
          branches[branchId] = toBranchStock(data);
        });

        set({
          branches,
          initializedFor: Array.from(new Set([...get().initializedFor, ...branchIds])),
        });
      },

      addMedicineWithBatch: async (branchId, input) => {
        await apiClient.createBranchMedicineBatch(branchId, input);
        const snapshot = await apiClient.getBranchInventory(branchId);
        set((state) => ({
          ...state,
          branches: { ...state.branches, [branchId]: toBranchStock(snapshot) },
        }));
      },

      importCsv: async (branchId, csvText) => {
        const result = await apiClient.importBranchCsv(branchId, csvText);
        const snapshot = await apiClient.getBranchInventory(branchId);
        set((state) => ({
          ...state,
          branches: { ...state.branches, [branchId]: toBranchStock(snapshot) },
        }));
        return result;
      },

      applySale: async (branchId, cart) => {
        try {
          await apiClient.createPOSTransaction({
            branchId,
            items: cart.map((item) => ({ batchId: item.batch.id, quantity: item.quantity })),
            customerId: undefined,
            prescriptionId: cart[0]?.prescriptionId,
            discountAmount: cart.reduce((sum, item) => sum + (item.discount || 0), 0),
            paymentMethod: 'CASH',
          });

          const snapshot = await apiClient.getBranchInventory(branchId);
          set((state) => ({
            ...state,
            branches: { ...state.branches, [branchId]: toBranchStock(snapshot) },
          }));
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.response?.data?.error || 'Failed to complete sale' };
        }
      },

      transferStock: async (sourceBranchId, destinationBranchId, lines) => {
        try {
          const result = await apiClient.transferBranchStock({
            sourceBranchId,
            destinationBranchId,
            lines,
          });

          const [sourceSnapshot, destinationSnapshot] = await Promise.all([
            apiClient.getBranchInventory(sourceBranchId),
            apiClient.getBranchInventory(destinationBranchId),
          ]);

          set((state) => ({
            ...state,
            branches: {
              ...state.branches,
              [sourceBranchId]: toBranchStock(sourceSnapshot),
              [destinationBranchId]: toBranchStock(destinationSnapshot),
            },
          }));

          return { success: true, moved: result.moved || 0 };
        } catch (error: any) {
          return { success: false, moved: 0, error: error.response?.data?.error || 'Transfer failed' };
        }
      },

      toggleBatchBlocked: async (branchId, batchId) => {
        await apiClient.toggleBranchBatchBlocked(branchId, batchId);
        const snapshot = await apiClient.getBranchInventory(branchId);
        set((state) => ({
          ...state,
          branches: { ...state.branches, [branchId]: toBranchStock(snapshot) },
        }));
      },
    }),
    { name: 'branch-inventory-store' }
  )
);
