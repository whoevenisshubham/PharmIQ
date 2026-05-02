import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchInventoryStore } from '@/stores/branchInventoryStore';

interface TenantStore {
    currentTenantId: string;
    tenants: Tenant[];
    setTenants: (tenants: Tenant[]) => void;
    switchTenant: (id: string) => void;
    getCurrentTenant: () => Tenant | undefined;
}

export const useTenantStore = create<TenantStore>()(
    persist(
        (set, get) => ({
            currentTenantId: 'T001',
            tenants: [],
            setTenants: (tenants) => {
                const { currentTenantId } = get();
                const hasCurrent = tenants.some((t) => t.id === currentTenantId);
                set({
                    tenants,
                    currentTenantId: hasCurrent ? currentTenantId : (tenants[0]?.id || currentTenantId),
                });
            },
            switchTenant: (id) => {
                set({ currentTenantId: id });
                void useBranchInventoryStore.getState().initializeBranches([id]);
                // Query cache invalidation handled in StoreSwitcher component
            },
            getCurrentTenant: () => {
                const { tenants, currentTenantId } = get();
                return tenants.find((t) => t.id === currentTenantId);
            },
        }),
        { name: 'tenant-store' }
    )
);
