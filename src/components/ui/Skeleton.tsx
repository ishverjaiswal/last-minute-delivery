import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-neutral-800/60', className)}
            {...props}
        />
    )
}

export function SkeletonMetrics({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="premium-card flex flex-col justify-between h-20 p-4 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex justify-between items-end">
                        <Skeleton className="h-6 w-10" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden w-full">
            <div className="p-5 border-b border-neutral-855 flex justify-between bg-neutral-900/50">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="overflow-x-auto">
                <table className="premium-table">
                    <thead>
                        <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="p-4">
                                    <Skeleton className="h-3 w-16" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850">
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r} className="premium-table-row">
                                {Array.from({ length: cols }).map((_, c) => (
                                    <td key={c} className="premium-table-cell">
                                        <Skeleton className="h-3.5 w-24" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="premium-card space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
            </div>
        </div>
    )
}

export function SkeletonDetails() {
    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-7 space-y-6">
                    <div className="premium-card space-y-6">
                        <Skeleton className="h-4 w-32 border-b border-neutral-850 pb-2" />
                        <div className="flex gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    )
}
