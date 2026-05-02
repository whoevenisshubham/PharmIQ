import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TableDensity, Theme } from '@/types';

interface UiStore {
    sidebarCollapsed: boolean;
    tableDensity: TableDensity;
    theme: Theme;
    commandBarOpen: boolean;
    notificationsOpen: boolean;
    toggleSidebar: () => void;
    setDensity: (d: TableDensity) => void;
    setTheme: (t: Theme) => void;
    setCommandBarOpen: (open: boolean) => void;
    setNotificationsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            tableDensity: 'comfortable',
            theme: 'dark',
            commandBarOpen: false,
            notificationsOpen: false,
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setDensity: (tableDensity) => set({ tableDensity }),
            setTheme: (theme) => set({ theme }),
            setCommandBarOpen: (commandBarOpen) => set({ commandBarOpen }),
            setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
        }),
        { name: 'ui-store' }
    )
);
