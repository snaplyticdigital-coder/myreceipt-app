/**
 * Date Utilities
 * Standardized UTC date handling for consistent storage and display
 * 
 * RULE: All dates are stored in UTC ISO format
 * RULE: All displays are converted to user's timezone
 */

// ============================================
// UTC CONVERSION
// ============================================

/**
 * Convert a date to UTC ISO string for storage
 * @param date - Date object, ISO string, or timestamp
 * @param timezone - Optional source timezone (defaults to browser timezone)
 */
export function toUTC(date: Date | string | number): string {
    const d = typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;

    if (isNaN(d.getTime())) {
        console.warn('[date-utils] Invalid date:', date);
        return new Date().toISOString();
    }

    return d.toISOString();
}

/**
 * Parse a UTC ISO string to a Date object
 * @param utcString - UTC ISO string from storage
 */
export function fromUTC(utcString: string): Date {
    const d = new Date(utcString);

    if (isNaN(d.getTime())) {
        console.warn('[date-utils] Invalid UTC string:', utcString);
        return new Date();
    }

    return d;
}

// ============================================
// TIMEZONE DISPLAY
// ============================================

/**
 * Format a UTC date string for display in user's timezone
 * @param utcString - UTC ISO string from storage
 * @param timezone - User's timezone (e.g., 'Asia/Kuala_Lumpur')
 * @param options - Intl.DateTimeFormat options
 */
export function formatLocalDate(
    utcString: string,
    timezone: string = 'Asia/Kuala_Lumpur',
    options: Intl.DateTimeFormatOptions = {}
): string {
    const date = fromUTC(utcString);

    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
    };

    try {
        return new Intl.DateTimeFormat('en-MY', defaultOptions).format(date);
    } catch (error) {
        console.warn('[date-utils] Error formatting date:', error);
        return date.toLocaleDateString();
    }
}

/**
 * Format a UTC date string with time for display
 */
export function formatLocalDateTime(
    utcString: string,
    timezone: string = 'Asia/Kuala_Lumpur'
): string {
    return formatLocalDate(utcString, timezone, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format time only (for receipts where date context is clear)
 */
export function formatLocalTime(
    utcString: string,
    timezone: string = 'Asia/Kuala_Lumpur'
): string {
    return formatLocalDate(utcString, timezone, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================
// RELATIVE TIME
// ============================================

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(utcString: string): string {
    const date = fromUTC(utcString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return 'just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return formatLocalDate(utcString);
    }
}

// ============================================
// DATE COMPARISON (Always in UTC)
// ============================================

/**
 * Check if two UTC dates are on the same calendar day
 */
export function isSameDay(utc1: string, utc2: string): boolean {
    return utc1.split('T')[0] === utc2.split('T')[0];
}

/**
 * Check if a UTC date is within a date range
 */
export function isWithinRange(
    utcDate: string,
    startUtc: string,
    endUtc: string
): boolean {
    const date = fromUTC(utcDate).getTime();
    const start = fromUTC(startUtc).getTime();
    const end = fromUTC(endUtc).getTime();

    return date >= start && date <= end;
}

/**
 * Get start of day in UTC
 */
export function startOfDayUTC(date: Date = new Date()): string {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

/**
 * Get end of day in UTC
 */
export function endOfDayUTC(date: Date = new Date()): string {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d.toISOString();
}

// ============================================
// CURRENT TIME
// ============================================

/**
 * Get current time as UTC ISO string
 */
export function nowUTC(): string {
    return new Date().toISOString();
}

/**
 * Get current date (date part only) as UTC string
 */
export function todayUTC(): string {
    return new Date().toISOString().split('T')[0];
}
