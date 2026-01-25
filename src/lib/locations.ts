/**
 * Malaysian Postcode Validation Utility
 * Validates postcodes and returns state/city information
 */

import postcodeData from './postcodes.json';

interface PostcodeValidationResult {
    valid: boolean;
    state?: string;
    city?: string;
}

interface StateData {
    ranges: number[][];
    cities: Record<string, string[]>;
}

type PostcodeDatabase = Record<string, StateData>;

/**
 * Validate a Malaysian postcode and return location info
 */
export function validateMalaysianPostcode(postcode: string): PostcodeValidationResult {
    // Basic validation: must be exactly 5 digits
    if (!postcode || !/^\d{5}$/.test(postcode)) {
        return { valid: false };
    }

    const postcodeNum = parseInt(postcode, 10);
    const db = postcodeData as PostcodeDatabase;

    // Find the state by checking ranges
    for (const [stateName, stateData] of Object.entries(db)) {
        // Check if postcode falls within any of the state's ranges
        const inRange = stateData.ranges.some(
            ([min, max]) => postcodeNum >= min && postcodeNum <= max
        );

        if (inRange) {
            // Try to find the specific city
            for (const [cityName, cityPostcodes] of Object.entries(stateData.cities)) {
                if (cityPostcodes.includes(postcode)) {
                    return {
                        valid: true,
                        state: stateName,
                        city: cityName,
                    };
                }
            }

            // Postcode in range but not in specific city list - still valid
            return {
                valid: true,
                state: stateName,
            };
        }
    }

    // Fallback: check all city lists directly
    for (const [stateName, stateData] of Object.entries(db)) {
        for (const [cityName, cityPostcodes] of Object.entries(stateData.cities)) {
            if (cityPostcodes.includes(postcode)) {
                return {
                    valid: true,
                    state: stateName,
                    city: cityName,
                };
            }
        }
    }

    return { valid: false };
}

/**
 * Get all states from the postcode database
 */
export function getAllStates(): string[] {
    return Object.keys(postcodeData as PostcodeDatabase);
}

/**
 * Get all cities for a given state
 */
export function getCitiesForState(state: string): string[] {
    const db = postcodeData as PostcodeDatabase;
    const stateData = db[state];
    if (!stateData) return [];
    return Object.keys(stateData.cities);
}

/**
 * Format postcode display (e.g., "50000 - Kuala Lumpur")
 */
export function formatPostcodeDisplay(postcode: string): string {
    const result = validateMalaysianPostcode(postcode);
    if (!result.valid) {
        return postcode;
    }

    if (result.city && result.state) {
        return `${postcode} - ${result.city}, ${result.state}`;
    } else if (result.state) {
        return `${postcode} - ${result.state}`;
    }

    return postcode;
}
