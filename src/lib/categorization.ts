export function categorizeItem(name: string): string[] {
    const lowerName = name.toLowerCase();
    const tags: string[] = [];

    // Simple keyword mapping for demo/MVP
    if (lowerName.match(/salmon|fish|prawn|crab|seafood/)) tags.push('Seafood', 'Fresh');
    else if (lowerName.match(/chicken|meat|beef|lamb|poultry/)) tags.push('Meat', 'Protein');
    else if (lowerName.match(/milk|cheese|yogurt|butter|dairy/)) tags.push('Dairy');
    else if (lowerName.match(/vegetable|spinach|carrot|lettuce/)) tags.push('Produce', 'Vegetable');
    else if (lowerName.match(/apple|grape|orange|fruit/)) tags.push('Fruit');
    else if (lowerName.match(/bread|cake|pastry|bakery/)) tags.push('Bakery');
    else if (lowerName.match(/rice|noodle|pasta/)) tags.push('Pantry');
    else if (lowerName.match(/coffee|tea|latte|drink|beverage/)) tags.push('Beverage');
    else if (lowerName.match(/soap|shampoo|detergent|clean/)) tags.push('Household');

    return tags;
}
