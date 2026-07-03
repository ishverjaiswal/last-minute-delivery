/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Bike } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { PageHeaderSkeleton, PageSkeleton } from '@/components/ui/PageSkeleton'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/agents/me')
            if (res.data.success) {
                setProfile(res.data.data)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const toggleAvailability = async () => {
        if (!profile || updating) return
        setUpdating(true)
        try {
            const targetState = !profile.availability
            const res = await axios.patch('/api/agents/me', {
                availability: targetState,
            })
            if (res.data.success) {
                setProfile((prev: any) => ({
                    ...prev,
                    availability: targetState,
                }))
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to toggle availability')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <PageSkeleton className="max-w-2xl">
                <PageHeaderSkeleton />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SkeletonCard />
                    <div className="md:col-span-2">
                        <SkeletonCard />
                    </div>
                </div>
            </PageSkeleton>
        )
    }

    if (error || !profile) {
        return (
            <PageSkeleton className="max-w-md mx-auto">
                <EmptyState
                    title="Failed to load agent profile"
                    description={
                        error ||
                        'Make sure you are logged in as a registered delivery agent.'
                    }
                    action={
                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="premium-button-primary h-8 text-xs"
                        >
                            Retry
                        </button>
                    }
                />
            </PageSkeleton>
        )
    }

    return (
        <div className="w-full max-w-2xl space-y-6 px-4 text-white">
            <PageHeader
                title="Agent Profile"
                description="Manage your delivery parameters, vehicle, and shift availability status."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="premium-card flex flex-col items-center space-y-4 text-center md:col-span-1">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-850">
                        <Bike
                            className="h-7 w-7 text-neutral-400"
                            aria-hidden="true"
                        />
                    </div>
                    <div>
                        <h2 className="premium-typo-card">
                            {profile.name || 'Anonymous Agent'}
                        </h2>
                        <p className="premium-typo-caption mt-0.5">
                            Delivery Officer
                        </p>
                    </div>

                    <div className="w-full space-y-3 border-t border-neutral-850 pt-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">Status</span>
                            <StatusBadge
                                status={
                                    profile.availability ? 'ONLINE' : 'OFFLINE'
                                }
                            />
                        </div>

                        <PremiumButton
                            variant="primary"
                            loading={updating}
                            loadingText={
                                profile.availability
                                    ? 'Going offline…'
                                    : 'Going online…'
                            }
                            onClick={toggleAvailability}
                            className="w-full h-9"
                        >
                            {profile.availability ? 'Go Offline' : 'Go Online'}
                        </PremiumButton>
                    </div>
                </div>

                <div className="premium-card space-y-6 md:col-span-2">
                    <section>
                        <h3 className="premium-typo-caption mb-4 border-b border-neutral-850 pb-2">
                            Employment Details
                        </h3>
                        <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Registered Email
                                </dt>
                                <dd className="font-bold text-neutral-200">
                                    {profile.email}
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Contact Number
                                </dt>
                                <dd className="font-bold text-neutral-200">
                                    {profile.phone}
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Assigned Zone
                                </dt>
                                <dd className="font-bold text-neutral-200">
                                    {profile.zoneName}
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Employee ID
                                </dt>
                                <dd className="font-mono text-[10px] font-bold text-neutral-200">
                                    {profile.id.slice(0, 8).toUpperCase()}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h3 className="premium-typo-caption mb-4 border-b border-neutral-850 pb-2">
                            Vehicle Specifications
                        </h3>
                        <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Vehicle Type
                                </dt>
                                <dd className="font-bold text-neutral-200">
                                    Eco EV Cargo-Van
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    License Plate
                                </dt>
                                <dd className="font-mono text-[10px] font-bold text-neutral-200">
                                    UP-78-EV-9823
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Payload Limit
                                </dt>
                                <dd className="font-bold text-neutral-200">
                                    500 kg max
                                </dd>
                            </div>
                            <div className="space-y-0.5">
                                <dt className="text-neutral-500 font-semibold">
                                    Telemetry ID
                                </dt>
                                <dd className="font-mono text-[10px] font-bold text-neutral-200">
                                    T-8523-EV
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>
        </div>
    )
}
