import { Batch } from '@/types';

/**
 * FEFO (First Expiry, First Out) algorithm
 * Returns batches sorted by expiry date ascending (nearest expiry first)
 * Excludes expired and blocked batches from auto-selection
 */
export function fefoSort(batches: Batch[]): Batch[] {
    return [...batches].sort((a, b) => {
        // Exhausted batches go last
        if (a.status === 'Exhausted' && b.status !== 'Exhausted') return 1;
        if (b.status === 'Exhausted' && a.status !== 'Exhausted') return -1;
        // Expired batches go last (before exhausted)
        if (a.status === 'Expired' && b.status !== 'Expired') return 1;
        if (b.status === 'Expired' && a.status !== 'Expired') return -1;
        // Blocked batches go last (before expired)
        if (a.status === 'Blocked' && b.status !== 'Blocked') return 1;
        if (b.status === 'Blocked' && a.status !== 'Blocked') return -1;
        // Sort available batches by expiry date (ascending)
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
}

/**
 * Get the first available batch using FEFO
 */
export function getFirstFEFOBatch(batches: Batch[]): Batch | null {
    const sorted = fefoSort(batches);
    return sorted.find((b) => b.status === 'Available' && b.quantity > 0) ?? null;
}

/**
 * Check if a batch is expired
 */
export function isBatchExpired(batch: Batch): boolean {
    return new Date(batch.expiryDate) < new Date();
}

/**
 * Get days until expiry
 */
export function daysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get expiry status for color coding
 */
export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'good';

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
    const days = daysUntilExpiry(expiryDate);
    if (days < 0) return 'expired';
    if (days <= 30) return 'critical';
    if (days <= 90) return 'warning';
    return 'good';
}
