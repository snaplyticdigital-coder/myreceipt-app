/**
 * Form validation utilities
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: string | number | null | undefined, fieldName: string): ValidationResult {
    if (value === null || value === undefined || value === '') {
        return {
            isValid: false,
            error: `${fieldName} is required`,
        };
    }
    return { isValid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): ValidationResult {
    if (value <= 0) {
        return {
            isValid: false,
            error: `${fieldName} must be greater than 0`,
        };
    }
    return { isValid: true };
}

/**
 * Validate date is not in future
 */
export function validateNotFuture(dateString: string): ValidationResult {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (date > today) {
        return {
            isValid: false,
            error: 'Date cannot be in the future',
        };
    }
    return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Invalid email format',
        };
    }
    return { isValid: true };
}
