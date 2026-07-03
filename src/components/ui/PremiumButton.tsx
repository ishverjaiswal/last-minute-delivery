'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    loading?: boolean
    loadingText?: string
}

export function PremiumButton({
    variant = 'primary',
    loading = false,
    loadingText,
    disabled,
    className,
    children,
    type = 'button',
    ...props
}: PremiumButtonProps) {
    const baseClass = variant === 'primary' ? 'premium-button-primary' : 'premium-button-secondary'

    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading}
            className={cn(baseClass, className)}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                    <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
                        aria-hidden="true"
                    />
                    {loadingText ?? children}
                </span>
            ) : (
                children
            )}
        </button>
    )
}
