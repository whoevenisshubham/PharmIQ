import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, FileText, ExternalLink } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { mockNotifications } from '@/data/mock';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { NotificationAlert } from '@/types';

const severityIcon = {
    critical: AlertTriangle,
    warning: Clock,
    info: FileText,
};

const severityColor = {
    critical: 'text-critical bg-critical/10 border-critical/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    info: 'text-primary bg-primary/10 border-primary/20',
};

export interface NotificationDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
    const navigate = useNavigate();

    const categories = {
        'Low Stock': mockNotifications.filter((n) => n.type === 'low_stock'),
        'Near Expiry': mockNotifications.filter((n) => n.type === 'near_expiry'),
        Prescriptions: mockNotifications.filter((n) => n.type === 'prescription'),
    };

    const handleAction = (n: NotificationAlert) => {
        if (n.actionUrl) navigate(n.actionUrl);
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/40"
                    />
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-96 h-full bg-surface border-l border-border shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                            <div>
                                <h2 className="font-display font-semibold text-text-1">Notifications</h2>
                                <p className="text-xs text-text-3">{mockNotifications.filter((n) => !n.isRead).length} unread</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                            {Object.entries(categories).map(([category, alerts]) => {
                                if (!alerts.length) return null;
                                return (
                                    <div key={category}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <p className="text-xs font-semibold text-text-2 uppercase tracking-wider">{category}</p>
                                            <span className={cn(
                                                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                                                category === 'Low Stock' ? 'bg-critical/10 text-critical' :
                                                    category === 'Near Expiry' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                                            )}>
                                                {alerts.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {alerts.map((alert) => {
                                                const Icon = severityIcon[alert.severity];
                                                return (
                                                    <div
                                                        key={alert.id}
                                                        className={cn(
                                                            'flex gap-3 p-3 rounded-lg border transition-colors',
                                                            !alert.isRead ? 'bg-surface-2' : 'bg-surface/50',
                                                            severityColor[alert.severity]
                                                        )}
                                                    >
                                                        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-text-1">{alert.title}</p>
                                                            <p className="text-xs text-text-2 mt-0.5">{alert.description}</p>
                                                            <p className="text-xs text-text-3 mt-1">
                                                                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                                            </p>
                                                            {alert.actionUrl && (
                                                                <button
                                                                    onClick={() => handleAction(alert)}
                                                                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                                                                >
                                                                    View <ExternalLink className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border px-4 py-3 flex-shrink-0">
                            <button className="w-full text-sm text-primary hover:underline">Mark all as read</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
