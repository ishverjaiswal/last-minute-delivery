/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRateCardSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { DEMO_DATA } from '@/lib/demo-data'
import { Sparkles, DollarSign } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable, Skeleton } from '@/components/ui/Skeleton'

export default function RateCardsPage() {
    const router = useRouter()
    const user = useCurrentUser()
    const role = user?.role

    const [rateCards, setRateCards] = useState<any[]>([])
    const [zones, setZones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createRateCardSchema),
        defaultValues: {
            zoneId: '',
            minWeight: 0,
            maxWeight: 10,
            basePrice: 5,
        },
    })

    const fetchData = async () => {
        try {
            const [ratesRes, zonesRes] = await Promise.all([
                axios.get('/api/rate-cards'),
                axios.get('/api/zones'),
            ])
            if (ratesRes.data.success) setRateCards(ratesRes.data.data)
            if (zonesRes.data.success) setZones(zonesRes.data.data)
        } catch (err) {
            console.error('Error fetching rate cards info:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (role) {
            if (role !== 'ADMIN') {
                router.push('/dashboard')
            } else {
                fetchData()
            }
        }
    }, [role])

    const fillSampleRateCard = () => {
        if (zones && zones.length > 0) {
            setValue('zoneId', zones[0].id, { shouldValidate: true })
        }
        setValue('minWeight', DEMO_DATA.rateCard.minWeight, { shouldValidate: true })
        setValue('maxWeight', DEMO_DATA.rateCard.maxWeight, { shouldValidate: true })
        setValue('basePrice', DEMO_DATA.rateCard.basePrice, { shouldValidate: true })
    }

    const onSubmit = async (values: any) => {
        setIsPending(true)
        setError(null)
        try {
            const res = await axios.post('/api/rate-cards', values)
            if (res.data.success) {
                alert('Rate Card pricing added successfully!')
                reset()
                fetchData()
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message)
        } finally {
            setIsPending(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full max-w-6xl space-y-6 px-4 text-white">
                <div className="space-y-1">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="lg:col-span-3">
                        <div className="premium-card space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <SkeletonTable rows={4} cols={5} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="premium-tyo-display">Pricing Rate Cards</h1>
                <p className="premium-tyo-secondary">Configure logistics base rates and weight ranges for serviceable zones.</p>
            </div>

            {/* Split layout (Left Form / Right Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                
                {/* Left Card: Create Rate Card Form (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 premium-card space-y-4 h-fit">
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-between border-b border-neutral-850 pb-2">
                        <h2 className="premium-tyo-card">Set Pricing Rules</h2>
                        <button
                            type="button"
                            onClick={fillSampleRateCard}
                            className="premium-button-secondary text-[10px] h-7 px-2 shrink-0 cursor-pointer"
                        >
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                            Fill Sample Rate
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="premium-form-group">
                            <label htmlFor="zoneId" className="premium-form-label">
                                Target Zone <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="zoneId"
                                {...register('zoneId')}
                                disabled={isPending}
                                className="premium-input w-full h-[2.25rem] bg-neutral-950 text-white animate-fade-in"
                            >
                                <option value="">Select a zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} ({zone.city})
                                    </option>
                                ))}
                            </select>
                            {errors.zoneId && (
                                <p className="premium-form-error">{errors.zoneId.message as string}</p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label htmlFor="minWeight" className="premium-form-label">
                                Min Weight (kg) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="minWeight"
                                type="number"
                                step="0.1"
                                {...register('minWeight', { valueAsNumber: true })}
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                            {errors.minWeight && (
                                <p className="premium-form-error">{errors.minWeight.message as string}</p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label htmlFor="maxWeight" className="premium-form-label">
                                Max Weight (kg) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="maxWeight"
                                type="number"
                                step="0.1"
                                {...register('maxWeight', { valueAsNumber: true })}
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                            {errors.maxWeight && (
                                <p className="premium-form-error">{errors.maxWeight.message as string}</p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label htmlFor="basePrice" className="premium-form-label">
                                Base Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="basePrice"
                                type="number"
                                step="0.01"
                                {...register('basePrice', { valueAsNumber: true })}
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                            {errors.basePrice && (
                                <p className="premium-form-error">{errors.basePrice.message as string}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="premium-button-primary w-full h-9 select-none cursor-pointer"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent animate-spin rounded-full" />
                                    Saving rule...
                                </span>
                            ) : 'Add Rate Card'}
                        </button>
                    </form>
                </div>

                {/* Right Card: Pricing Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-855 bg-neutral-900/50">
                        <h2 className="premium-tyo-card">Active Pricing Rules ({rateCards.length})</h2>
                    </div>

                    {rateCards.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4">Zone</th>
                                        <th className="p-4">Weight Range</th>
                                        <th className="p-4">Base Price</th>
                                        <th className="p-4">Created</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {rateCards.map((card) => {
                                        const zone = zones.find((z) => z.id === card.zoneId)
                                        return (
                                            <tr key={card.id} className="premium-table-row">
                                                <td className="premium-table-cell">
                                                    <span className="text-indigo-400 font-extrabold">{zone ? zone.name : 'Unknown Zone'}</span>
                                                    {zone && <span className="text-[10px] text-neutral-500 block">{zone.city}</span>}
                                                </td>
                                                <td className="premium-table-cell font-mono text-neutral-200">
                                                    {card.minWeight} kg - {card.maxWeight} kg
                                                </td>
                                                <td className="premium-table-cell font-extrabold text-white">
                                                    ${card.basePrice.toFixed(2)}
                                                </td>
                                                <td className="premium-table-cell text-neutral-500">
                                                    {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="premium-table-action">
                                                    <button
                                                        onClick={() => alert(`Rate Card editing is restricted.`)}
                                                        className="premium-button-secondary h-8 text-[10px] cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Empty state primitive */
                        <EmptyState 
                            icon={DollarSign} 
                            title="No rate cards configured" 
                            description="Create a rate card pricing rule to charge for shipments." 
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
