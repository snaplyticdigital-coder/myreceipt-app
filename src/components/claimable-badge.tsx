

interface ClaimableBadgeProps {
    claimable: boolean;
    size?: 'sm' | 'md';
}

export function ClaimableBadge({ claimable, size = 'sm' }: ClaimableBadgeProps) {
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${claimable
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
        >
            {claimable ? 'Claimable' : 'Not Claimable'}
        </span>
    );
}
