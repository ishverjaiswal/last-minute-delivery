import React from 'react'
import { cn } from '@/lib/utils'

export interface FormAlertProps {
    variant: 'error' | 'success'
    message: string
    className?: string
}

export function FormAlert({ variant, message, className }: FormAlertProps) {
    return (
        <div
            role="alert"
            className={cn(
                'rounded-lg border p-3 text-center text-xs',
                variant === 'success'
                    ? 'border-green-500/20 bg-green-500/10 text-green-500'
                    : 'border-red-500/20 bg-red-500/10 text-red-500',
                className
            )}
        >
            {message}
        </div>
    )
}
