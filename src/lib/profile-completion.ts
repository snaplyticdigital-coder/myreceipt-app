/**
 * Profile Completion Engine
 * Calculates profile completion percentage based on weighted fields
 */

import type { User } from '../types';

// Field weights configuration (total = 100%)
const FIELD_WEIGHTS = {
    name: 10,
    email: 10,
    dateOfBirth: 15,
    gender: 10,
    phone: 15,
    salaryRange: 15,
    occupation: 15,
    postcode: 10,
} as const;

type ProfileField = keyof typeof FIELD_WEIGHTS;

interface ProfileCompletionResult {
    percentage: number;
    completedFields: ProfileField[];
    incompleteFields: ProfileField[];
    nextFieldToComplete: ProfileField | null;
}

/**
 * Check if a field is considered complete
 */
function isFieldComplete(user: User, field: ProfileField): boolean {
    switch (field) {
        case 'name':
            return !!user.name && user.name.trim().length > 0;
        case 'email':
            return !!user.email && user.email.includes('@');
        case 'dateOfBirth':
            return !!user.dateOfBirth && user.dateOfBirth.length > 0;
        case 'gender':
            return !!user.gender;
        case 'phone':
            return !!user.phone && user.phone.length >= 10;
        case 'salaryRange':
            return !!user.salaryRange && user.salaryRange.length > 0;
        case 'occupation':
            return !!user.occupation && user.occupation.length > 0;
        case 'postcode':
            return !!user.postcode && user.postcode.length === 5;
        default:
            return false;
    }
}

/**
 * Get human-readable field name
 */
export function getFieldDisplayName(field: ProfileField): string {
    const displayNames: Record<ProfileField, string> = {
        name: 'Name',
        email: 'Email',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        phone: 'Phone Number',
        salaryRange: 'Salary Range',
        occupation: 'Occupation',
        postcode: 'Postcode',
    };
    return displayNames[field];
}

/**
 * Calculate profile completion for a user
 */
export function calculateProfileCompletion(user: User): ProfileCompletionResult {
    const allFields = Object.keys(FIELD_WEIGHTS) as ProfileField[];
    const completedFields: ProfileField[] = [];
    const incompleteFields: ProfileField[] = [];

    let totalWeight = 0;

    for (const field of allFields) {
        if (isFieldComplete(user, field)) {
            completedFields.push(field);
            totalWeight += FIELD_WEIGHTS[field];
        } else {
            incompleteFields.push(field);
        }
    }

    // Round to nearest integer
    const percentage = Math.round(totalWeight);

    // Get next field to complete (by weight, highest first)
    const sortedIncomplete = incompleteFields.sort(
        (a, b) => FIELD_WEIGHTS[b] - FIELD_WEIGHTS[a]
    );
    const nextFieldToComplete = sortedIncomplete[0] || null;

    return {
        percentage,
        completedFields,
        incompleteFields,
        nextFieldToComplete,
    };
}

/**
 * Get a hint message for the next field to complete
 */
export function getCompletionHint(user: User): string | null {
    const { nextFieldToComplete, percentage } = calculateProfileCompletion(user);

    if (percentage >= 100 || !nextFieldToComplete) {
        return null;
    }

    const fieldName = getFieldDisplayName(nextFieldToComplete);
    return `Add your ${fieldName} to complete your profile`;
}
