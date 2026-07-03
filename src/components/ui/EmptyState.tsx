import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>
    title: string
    description: string
    action?: React.ReactNode
    secondaryAction?: React.ReactNode
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('premium-empty-state', className)} role="status">
            {Icon && (
                <Icon
                    className="premium-empty-icon mb-2 h-6 w-6 text-neutral-500"
                    aria-hidden="true"
                />
            )}
            <h3 className="premium-empty-title">{title}</h3>
            <p className="premium-empty-desc">{description}</p>
            {(action || secondaryAction) && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {action}
                    {secondaryAction}
                </div>
            )}
        </div>
    )
}
