import type { ReactNode } from 'react';

interface SectionHeaderProps {
    title: string;
    icon: ReactNode;
    subtitle?: string; // For the 'PRO INSIGHTS' type label
    rightElement?: ReactNode; // For 'View All' links or badges
    className?: string;
}

export function SectionHeader({ title, icon, subtitle, rightElement, className = "" }: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-5 ${className}`}>
            <div className="flex items-center gap-3">
                {/* 20px Corner Radius Container */}
                <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 shrink-0">
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
                    {subtitle && (
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {rightElement}
        </div>
    );
}
