import React from 'react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'

export interface ActivityItem {
    id: string
    status: string
    timestamp: string
    actor?: string
}

export interface ActivityTimelineProps {
    items: ActivityItem[]
    emptyMessage?: string
    className?: string
}

export function ActivityTimeline({
    items,
    emptyMessage = 'No activity recorded.',
    className,
}: ActivityTimelineProps) {
    if (items.length === 0) {
        return (
            <p className="py-6 text-center text-xs text-neutral-500">
                {emptyMessage}
            </p>
        )
    }

    return (
        <div
            className={cn(
                'relative space-y-4 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-[2px] before:bg-neutral-800',
                className
            )}
        >
            {items.map((item) => (
                <div key={item.id} className="relative flex gap-4">
                    <div className="z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-850 text-xs font-bold text-neutral-400">
                        ✓
                    </div>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={item.status} />
                            {item.actor && (
                                <span className="text-xs text-neutral-400">
                                    by {item.actor}
                                </span>
                            )}
                        </div>
                        <time
                            className="text-[10px] font-medium text-neutral-500"
                            dateTime={item.timestamp}
                        >
                            {item.timestamp}
                        </time>
                    </div>
                </div>
            ))}
        </div>
    )
}
