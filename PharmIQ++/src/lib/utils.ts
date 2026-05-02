import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
    return new Date(iso).toLocaleDateString('en-IN', opts ?? { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
