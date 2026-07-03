'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TableToolbarProps {
    children: React.ReactNode
    resultCount?: { shown: number; total: number }
    className?: string
}

export function TableToolbar({
    children,
    resultCount,
    className,
}: TableToolbarProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 border-b border-neutral-850 bg-neutral-950/40 p-4 lg:flex-row lg:items-center lg:justify-between',
                className
            )}
        >
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                {children}
            </div>
            {resultCount !== undefined && (
                <span
                    className="premium-typo-secondary shrink-0 whitespace-nowrap font-semibold"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    Showing {resultCount.shown} of {resultCount.total} results
                </span>
            )}
        </div>
    )
}
