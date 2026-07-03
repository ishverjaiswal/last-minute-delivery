import React from 'react'
import { cn } from '@/lib/utils'

export interface TimelineStep {
    label: string
    key: string
    timestamp?: string | null
}

export interface TimelineProps {
    steps: TimelineStep[]
    currentIndex: number
    isComplete?: boolean
    className?: string
}

export function Timeline({ steps, currentIndex, isComplete = false, className }: TimelineProps) {
    const progressWidth =
        isComplete
            ? 'calc(100% - 48px)'
            : currentIndex > 0
              ? `calc(${(currentIndex / (steps.length - 1)) * 100}% - 48px)`
              : '0px'

    return (
        <div className={cn('relative flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-center', className)}>
            <div className="absolute left-6 right-6 top-4 -z-0 hidden h-[2px] bg-neutral-800 sm:block" />
            <div
                className="absolute left-6 top-4 -z-0 hidden h-[2px] bg-green-500 transition-all duration-500 sm:block"
                style={{ width: progressWidth }}
            />
            <div className="absolute bottom-2 left-4 top-2 -z-0 block w-[2px] bg-neutral-800 sm:hidden" />

            {steps.map((step, idx) => {
                const isStepComplete = idx < currentIndex || isComplete
                const isCurrent = idx === currentIndex && !isComplete

                let nodeClass = 'border-neutral-800 bg-neutral-950 text-neutral-500'
                let labelClass = 'text-neutral-500'

                if (isStepComplete) {
                    nodeClass = 'border-green-500 bg-green-500/10 text-green-500'
                    labelClass = 'text-green-500 font-bold'
                } else if (isCurrent) {
                    nodeClass = 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    labelClass = 'text-indigo-400 font-extrabold'
                }

                return (
                    <div
                        key={step.key}
                        className="relative z-10 flex flex-1 flex-row items-center gap-4 pl-2 sm:flex-col sm:gap-2 sm:pl-0 sm:text-center"
                    >
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300',
                                nodeClass
                            )}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {isStepComplete ? '✓' : idx + 1}
                        </div>
                        <div className="space-y-0.5 text-left sm:text-center">
                            <p className={cn('text-[10px] font-bold uppercase tracking-tight transition-colors duration-300', labelClass)}>
                                {step.label}
                            </p>
                            {step.timestamp && (
                                <p className="text-[10px] font-medium text-neutral-500">{step.timestamp}</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
