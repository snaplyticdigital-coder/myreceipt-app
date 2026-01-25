import React from 'react';


interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    subtitle,
    icon,
    rightElement,
    className = ''
}: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-5 ${className}`}>
            <div className="flex items-center gap-2.5">
                {/* Rounded Square Icon Container */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200/50 flex-shrink-0">
                    {/* Render icon clone with specific styles if it's a valid element, or just render it */}
                    {React.isValidElement(icon) ? (
                        React.cloneElement(icon as any, {
                            size: 16,
                            className: "text-white stroke-[1.5px]" // Thin stroke white line icon
                        })
                    ) : (
                        icon
                    )}
                </div>
                <div>
                    <h2 className="text-[15px] font-bold text-gray-800 tracking-tight leading-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {rightElement && (
                <div>
                    {rightElement}
                </div>
            )}
        </div>
    );
}
