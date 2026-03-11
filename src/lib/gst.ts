/**
 * GST calculation utilities for Indian pharmacy billing
 */

export type GSTRate = 5 | 12 | 18;

export interface GSTBreakdown {
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    isInterState: boolean;
}

/**
 * Calculate GST breakdown for a given amount and rate
 * @param amount - taxable amount (before GST)
 * @param rate - GST rate (5, 12, or 18)
 * @param isInterState - if true, uses IGST; if false, uses CGST+SGST
 */
export function calculateGST(amount: number, rate: GSTRate, isInterState = false): GSTBreakdown {
    const totalGst = (amount * rate) / 100;

    if (isInterState) {
        return {
            taxableAmount: amount,
            cgst: 0,
            sgst: 0,
            igst: totalGst,
            totalGst,
            isInterState: true,
        };
    }

    const halfGst = totalGst / 2;
    return {
        taxableAmount: amount,
        cgst: halfGst,
        sgst: halfGst,
        igst: 0,
        totalGst,
        isInterState: false,
    };
}

/**
 * Get inclusive price breakdown (price includes GST)
 */
export function reverseCalculateGST(inclusiveAmount: number, rate: GSTRate): { taxable: number; gst: number } {
    const divisor = 1 + rate / 100;
    const taxable = inclusiveAmount / divisor;
    const gst = inclusiveAmount - taxable;
    return { taxable: Math.round(taxable * 100) / 100, gst: Math.round(gst * 100) / 100 };
}

/**
 * Format Indian currency
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format number in Indian number system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

/**
 * HSN code to GST rate lookup (simplified)
 */
export const HSN_GST_MAP: Record<string, GSTRate> = {
    '30041099': 12,
    '30049099': 12,
    '30043910': 5,
    '30039099': 18,
};

export function getGSTRateByHSN(hsnCode: string): GSTRate {
    return HSN_GST_MAP[hsnCode] ?? 12;
}
