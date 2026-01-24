
import type { LhdnTag } from '../types';
import { lhdnTagColors } from '../lib/mock-data';

interface LhdnTagChipProps {
    tag: LhdnTag;
    onRemove?: () => void;
}

export function LhdnTagChip({ tag, onRemove }: LhdnTagChipProps) {
    const colorClass = lhdnTagColors[tag];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
            {tag}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="hover:opacity-70 transition-opacity ml-1"
                    aria-label={`Remove ${tag} tag`}
                >
                    ×
                </button>
            )}
        </span>
    );
}
