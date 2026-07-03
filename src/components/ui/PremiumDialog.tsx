'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PremiumDialogProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children?: React.ReactNode
    footer?: React.ReactNode
    className?: string
    'aria-describedby'?: string
}

export function PremiumDialog({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: PremiumDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)
        dialogRef.current?.focus()

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="premium-dialog-title"
                aria-describedby={description ? 'premium-dialog-description' : undefined}
                tabIndex={-1}
                className={cn('premium-dialog max-w-md', className)}
            >
                <div className="premium-dialog-header">
                    <h2 id="premium-dialog-title" className="premium-typo-card">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="premium-dialog-close"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {(description || children) && (
                    <div className="premium-dialog-body space-y-3">
                        {description && (
                            <p id="premium-dialog-description" className="premium-typo-secondary">
                                {description}
                            </p>
                        )}
                        {children}
                    </div>
                )}

                {footer && <div className="premium-dialog-footer">{footer}</div>}
            </div>
        </div>
    )
}
