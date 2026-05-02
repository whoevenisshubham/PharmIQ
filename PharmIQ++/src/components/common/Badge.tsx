import { cn } from '@/lib/utils';
import { BatchStatus, ScheduleType } from '@/types';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'muted';
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md';
}

const variantStyles = {
    default: 'bg-surface-2 text-text-2 border-border',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    critical: 'bg-critical/10 text-critical border-critical/20',
    info: 'bg-primary/10 text-primary border-primary/20',
    muted: 'bg-surface-2/50 text-text-3 border-border',
};

export function Badge({ variant = 'default', children, className, size = 'md' }: BadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-full border font-medium',
            size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs px-2 py-0.5',
            variantStyles[variant],
            className
        )}>
            {children}
        </span>
    );
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
    const map: Record<BatchStatus, { label: string; variant: BadgeProps['variant'] }> = {
        Available: { label: 'Available', variant: 'success' },
        Blocked: { label: 'Blocked', variant: 'warning' },
        Expired: { label: 'Expired', variant: 'critical' },
        Exhausted: { label: 'Exhausted', variant: 'muted' },
    };
    const { label, variant } = map[status];
    return <Badge variant={variant}>{label}</Badge>;
}

export function ScheduleBadge({ schedule }: { schedule: ScheduleType }) {
    const map: Record<ScheduleType, { variant: BadgeProps['variant'] }> = {
        OTC: { variant: 'success' },
        H: { variant: 'warning' },
        H1: { variant: 'critical' },
        X: { variant: 'critical' },
    };
    return <Badge variant={map[schedule].variant}>Sch-{schedule}</Badge>;
}

export function StockStatusBadge({ qty, reorderPoint }: { qty: number; reorderPoint: number }) {
    if (qty === 0) return <Badge variant="critical">Out of Stock</Badge>;
    if (qty <= reorderPoint) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
}
