import React from 'react'
import { cn } from '@/lib/utils'

export function PageSkeleton({
    children,
    className,
}: {
    children?: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                'w-full max-w-6xl space-y-6 px-4 text-white',
                className
            )}
        >
            {children}
        </div>
    )
}

export function PageHeaderSkeleton() {
    return (
        <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded-md bg-neutral-800/60" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-neutral-800/60" />
        </div>
    )
}
