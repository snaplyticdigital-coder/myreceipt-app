import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kuala_Lumpur';

/**
 * Format amount to Malaysian Ringgit currency with thousand separators
 * Example: 1234.56 → "RM 1,234.56"
 */
export function formatCurrency(amount: number): string {
    return `RM ${amount.toLocaleString('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Format date to DD MMM YYYY format
 */
export function formatDate(dateString: string): string {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy');
}

/**
 * Get time-based greeting for Malaysian timezone
 */
export function getGreeting(name?: string): string {
    const now = toZonedTime(new Date(), TIMEZONE);
    const hour = now.getHours();

    let timeGreeting = '';
    if (hour < 12) {
        timeGreeting = 'Good morning';
    } else if (hour < 18) {
        timeGreeting = 'Good afternoon';
    } else {
        timeGreeting = 'Good evening';
    }

    return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

/**
 * Check if a date string is in the future
 */
export function isFutureDate(dateString: string): boolean {
    const date = parseISO(dateString);
    const today = startOfDay(new Date());
    return isAfter(date, today);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
    return format(new Date(), 'yyyy-MM');
}

/**
 * Format month string to readable format
 */
export function formatMonth(monthString: string): string {
    // monthString is in YYYY-MM format
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy');
}

/**
 * Get month options for dropdown (current month and previous 11 months)
 */
export function getMonthOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = format(date, 'yyyy-MM');
        const label = format(date, 'MMMM yyyy');
        options.push({ value, label });
    }

    return options;
}

/**
 * Calculate difference percentage
 */
export function calculateDelta(current: number, previous: number): {
    amount: number;
    percent: number;
    isPositive: boolean;
} {
    const amount = current - previous;
    const percent = previous === 0 ? 0 : (amount / previous) * 100;

    return {
        amount,
        percent,
        isPositive: amount >= 0,
    };
}

/**
 * Generate a random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
