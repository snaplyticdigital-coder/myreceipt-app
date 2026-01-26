/**
 * Verification Status Badge
 * Displays the verification status of a receipt
 */

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { VerificationStatus } from '../types';

interface VerificationBadgeProps {
    status: VerificationStatus;
    size?: 'sm' | 'md';
}

export function VerificationBadge({ status, size = 'sm' }: VerificationBadgeProps) {
    const config = getStatusConfig(status);
    const iconSize = size === 'sm' ? 12 : 14;

    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full font-medium
            ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
            ${config.bg} ${config.text}
        `}>
            {config.icon(iconSize)}
            {config.label}
        </span>
    );
}

function getStatusConfig(status: VerificationStatus) {
    switch (status) {
        case 'pending':
            return {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                icon: (size: number) => <Clock size={size} />,
                label: 'Pending',
            };
        case 'verified':
            return {
                bg: 'bg-green-100',
                text: 'text-green-700',
                icon: (size: number) => <CheckCircle size={size} />,
                label: 'Verified',
            };
        case 'rejected':
            return {
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: (size: number) => <XCircle size={size} />,
                label: 'Rejected',
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-600',
                icon: (size: number) => <Clock size={size} />,
                label: 'Unknown',
            };
    }
}
