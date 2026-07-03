import React from 'react'
import { cn } from '@/lib/utils'

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    status?: string
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
    const rawVal = status || (typeof children === 'string' ? children : '')
    const normalized = rawVal.trim().toUpperCase()

    let variantClass = 'premium-badge-pending' // fallback

    switch (normalized) {
        case 'PENDING':
        case 'OTP PENDING':
        case 'WAITING':
            variantClass = 'premium-badge-pending'
            break
        case 'CONFIRMED':
            variantClass = 'premium-badge-confirmed'
            break
        case 'ASSIGNED':
        case 'ONLINE':
            variantClass = 'premium-badge-assigned'
            break
        case 'PICKED_UP':
        case 'OTP SENT':
        case 'OTP RESENT':
            variantClass = 'premium-badge-picked-up'
            break
        case 'OUT_FOR_DELIVERY':
            variantClass = 'premium-badge-out-for-delivery'
            break
        case 'DELIVERED':
        case 'VERIFIED':
        case 'SUCCESS':
        case 'COMPLETED':
        case 'OTP VERIFIED':
            variantClass = 'premium-badge-delivered'
            break
        case 'CANCELLED':
        case 'EXPIRED':
        case 'OFFLINE':
        case 'FAILED':
            variantClass = 'premium-badge-cancelled'
            break
    }

    return (
        <span
            className={cn('premium-badge', variantClass, className)}
            {...props}
        >
            {children || rawVal}
        </span>
    )
}
