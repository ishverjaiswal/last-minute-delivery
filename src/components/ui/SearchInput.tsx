'use client'

import React, { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    onClear?: () => void
    containerClassName?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onClear,
            placeholder = 'Search…',
            className,
            containerClassName,
            ...props
        },
        ref
    ) => {
        const hasValue =
            typeof value === 'string' ? value.length > 0 : Boolean(value)

        return (
            <div className={cn('relative flex-1', containerClassName)}>
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                />
                <input
                    ref={ref}
                    type="search"
                    role="searchbox"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn('premium-input w-full pl-9 pr-8', className)}
                    {...props}
                />
                {hasValue && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        )
    }
)

SearchInput.displayName = 'SearchInput'
