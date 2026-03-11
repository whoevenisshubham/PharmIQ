import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalCommandBar } from './GlobalCommandBar';
import { useUiStore } from '@/stores/uiStore';

export function AppShell({ children }: { children: ReactNode }) {
    const location = useLocation();
    const { commandBarOpen } = useUiStore();

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: '#0a0e1a',
            fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
        }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <Topbar />
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: '#0a0e1a',
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            style={{ minHeight: '100%' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Global overlays */}
            {commandBarOpen && <GlobalCommandBar />}
        </div>
    );
}
