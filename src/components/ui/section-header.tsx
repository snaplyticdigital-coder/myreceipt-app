import { ReactNode } from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    rightElement?: ReactNode;
    className?: string;
    iconClassName?: string;
}

export function SectionHeader({
    title,
    subtitle,
    icon,
    rightElement,
    className = "",
    iconClassName = "from-blue-500 to-purple-600"
}: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-3">
                {/* Iconic Rounded Square Container */}
                <div className={`w-10 h-10 rounded-[20px] bg-gradient-to-br ${iconClassName} flex items-center justify-center shadow-lg shadow-purple-200/50 shrink-0`}>
                    {/* Thin-stroke icon style wrapper */}
                    <div className="text-white [&>svg]:stroke-[1.5px]">
                        {icon}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[12px] font-medium text-blue-600 uppercase tracking-wider leading-none mt-0.5">
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
