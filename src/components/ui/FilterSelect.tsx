'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
}

export function FilterSelect({ label, className, id, children, ...props }: FilterSelectProps) {
    return (
        <div className="flex items-center gap-2">
            {label && (
                <label htmlFor={id} className="premium-typo-secondary whitespace-nowrap font-semibold">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={cn('premium-input bg-neutral-950 font-semibold', className)}
                {...props}
            >
                {children}
            </select>
        </div>
    )
}
