import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

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
            setTenants: (tenants) => set({ tenants }),
            switchTenant: (id) => {
                set({ currentTenantId: id });
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
