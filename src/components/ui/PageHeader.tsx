import React from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
                className
            )}
        >
            <div className="space-y-1">
                <h1 className="premium-typo-display">{title}</h1>
                {description && (
                    <p className="premium-typo-secondary">{description}</p>
                )}
            </div>
            {action}
        </div>
    )
}
