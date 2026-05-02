import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
    return <div className={cn('skeleton rounded-md', className)} style={style} />;
}

export function KPICardSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full rounded" />
        </div>
    );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-1">
            {/* Header */}
            <div className="flex gap-4 px-4 py-2">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-3 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 px-4 py-3 border-t border-border">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} className={cn('h-4 flex-1', j === 0 ? 'max-w-[200px]' : '')} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
    return (
        <div className={cn('w-full flex items-end gap-1 px-4', height)}>
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="flex-1"
                    style={{ height: `${30 + Math.random() * 60}%` } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

export function DrawerSkeleton() {
    return (
        <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
