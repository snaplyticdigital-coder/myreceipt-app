// import type { SpendingCategory } from '../types';

/**
 * Smartly infers the SpendingCategory based on merchant name and optional supplier type string.
 */

export function inferCategory(merchantName?: string | null, supplierType?: string | null): string {
    const name = merchantName?.toLowerCase() || '';
    const type = supplierType?.toLowerCase() || '';

    // 1. Direct Type Mapping (from Document AI or keywords)
    if (type.includes('restaurant') || type.includes('food') || type.includes('cafe') || type.includes('bakery')) {
        return 'Dining & Food';
    }
    if (type.includes('grocery') || type.includes('supermarket')) {
        return 'Groceries';
    }
    if (type.includes('pharmacy') || type.includes('health') || type.includes('clinic')) {
        return 'Healthcare';
    }
    if (type.includes('fuel') || type.includes('petrol') || type.includes('gas station') || type.includes('transport')) {
        return 'Transportation';
    }

    // 2. Keyword Matching on Merchant Name (High Priority)

    // Dining & Food
    if (
        name.includes('restaurant') ||
        name.includes('cafe') ||
        name.includes('coffee') ||
        name.includes('bistro') ||
        name.includes('kfc') ||
        name.includes('mcdonald') ||
        name.includes('starbucks') ||
        name.includes('pizzahut') ||
        name.includes('domino') ||
        name.includes('burger') ||
        name.includes('sushi') ||
        name.includes('mamak')
    ) {
        return 'Dining & Food';
    }

    // Groceries
    if (
        name.includes('jaya grocer') ||
        name.includes('village grocer') ||
        name.includes('aeon') ||
        name.includes('tesco') ||
        name.includes('lotus') ||
        name.includes('market') ||
        name.includes('hero market') ||
        name.includes('99 speedmart') ||
        name.includes('kk mart') ||
        name.includes('7-eleven') // Convenience stores often mapped to Groceries or Others
    ) {
        return 'Groceries';
    }

    // Transportation / Fuel
    if (
        name.includes('petronas') ||
        name.includes('shell') ||
        name.includes('caltex') ||
        name.includes('petron') ||
        name.includes('bhp') ||
        name.includes('grab') ||
        name.includes('uber') ||
        name.includes('tng') // Touch 'n Go often transport
    ) {
        return 'Transportation';
    }

    // Healthcare
    if (
        name.includes('pharmacy') ||
        name.includes('watsons') ||
        name.includes('guardian') ||
        name.includes('caring') ||
        name.includes('clinic') ||
        name.includes('hospital') ||
        name.includes('doctor') ||
        name.includes('dental')
    ) {
        return 'Healthcare';
    }

    // Shopping
    if (
        name.includes('zara') ||
        name.includes('h&m') ||
        name.includes('uniqlo') ||
        name.includes('ikea') ||
        name.includes('shopee') ||
        name.includes('lazada') ||
        name.includes('mall') ||
        name.includes('department store')
    ) {
        return 'Shopping';
    }

    // Utilities
    if (
        name.includes('tnb') ||
        name.includes('tenaga') ||
        name.includes('air selangor') ||
        name.includes('maxis') ||
        name.includes('celcom') ||
        name.includes('digi') ||
        name.includes('time dot com') ||
        name.includes('tm') ||
        name.includes('unifi')
    ) {
        return 'Utilities';
    }

    // Default catch-all
    return 'Shopping';
}
