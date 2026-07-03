import React from 'react'
import { cn } from '@/lib/utils'

export function TableContainer({
    title,
    count,
    action,
    toolbar,
    children,
    className,
}: {
    title?: string
    count?: number
    action?: React.ReactNode
    toolbar?: React.ReactNode
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('overflow-hidden rounded-xl border border-neutral-850 bg-neutral-900', className)}>
            {(title || action) && (
                <div className="flex items-center justify-between border-b border-neutral-855 bg-neutral-900/50 p-5">
                    {title && (
                        <h2 className="premium-typo-card">
                            {title}
                            {count !== undefined && ` (${count})`}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {toolbar}
            {children}
        </div>
    )
}

export function PremiumTable({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="overflow-x-auto">
            <table className={cn('premium-table', className)}>{children}</table>
        </div>
    )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead>{children}</thead>
}

export function TableHeaderRow({ children }: { children: React.ReactNode }) {
    return (
        <tr className="border-b border-neutral-850 bg-neutral-950 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {children}
        </tr>
    )
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
    return <th className={cn('premium-table-header p-4', className)}>{children}</th>
}

export function TableBody({ children }: { children: React.ReactNode }) {
    return <tbody className="divide-y divide-neutral-850">{children}</tbody>
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <tr className={cn('premium-table-row', className)}>{children}</tr>
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
    return <td className={cn('premium-table-cell', className)}>{children}</td>
}

export function TableActionCell({ children }: { children: React.ReactNode }) {
    return <td className="premium-table-action">{children}</td>
}
