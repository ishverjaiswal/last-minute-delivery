import { Skeleton } from '@/components/ui/Skeleton'

export function AuthFormSkeleton() {
    return (
        <div
            className="premium-card w-full max-w-md space-y-4"
            aria-hidden="true"
        >
            <div className="space-y-2 text-center">
                <Skeleton className="mx-auto h-6 w-40" />
                <Skeleton className="mx-auto h-3 w-56" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}
