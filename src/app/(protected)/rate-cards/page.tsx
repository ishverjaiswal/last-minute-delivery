/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRateCardSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message)
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading pricing models...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Pricing Rate Cards</h1>
                <p className="text-sm text-neutral-400">Configure logistics base rates and weight ranges for serviceable zones.</p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Left Card: Create Rate Card Form (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4 h-fit">
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">Set Pricing Rules</h2>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-xs text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="zoneId">Target Zone</Label>
                            <select
                                id="zoneId"
                                {...register('zoneId')}
                                disabled={isPending}
                                className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                            >
                                <option value="">Select a zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} ({zone.city})
                                    </option>
                                ))}
                            </select>
                            {errors.zoneId && (
                                <p className="text-xs text-red-500">{errors.zoneId.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="minWeight">Min Weight (kg)</Label>
                            <Input
                                id="minWeight"
                                type="number"
                                step="0.1"
                                {...register('minWeight', { valueAsNumber: true })}
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.minWeight && (
                                <p className="text-xs text-red-500">{errors.minWeight.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                            <Input
                                id="maxWeight"
                                type="number"
                                step="0.1"
                                {...register('maxWeight', { valueAsNumber: true })}
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.maxWeight && (
                                <p className="text-xs text-red-500">{errors.maxWeight.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="basePrice">Base Price ($)</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                step="0.01"
                                {...register('basePrice', { valueAsNumber: true })}
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.basePrice && (
                                <p className="text-xs text-red-500">{errors.basePrice.message as string}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-2.5 rounded-lg text-sm shadow cursor-pointer"
                        >
                            {isPending ? 'Saving rule...' : 'Add Rate Card'}
                        </Button>
                    </form>
                </div>

                {/* Right Card: Pricing Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-855">
                        <h2 className="text-lg font-bold tracking-tight">Active Pricing Rules ({rateCards.length})</h2>
                    </div>

                    {rateCards.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
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
                                            <tr key={card.id} className="hover:bg-neutral-850/20 transition-colors">
                                                <td className="p-4">
                                                    <span className="text-indigo-400 font-extrabold">{zone ? zone.name : 'Unknown Zone'}</span>
                                                    {zone && <span className="text-[10px] text-neutral-500 block">{zone.city}</span>}
                                                </td>
                                                <td className="p-4 text-xs text-neutral-200 font-medium">
                                                    {card.minWeight} kg - {card.maxWeight} kg
                                                </td>
                                                <td className="p-4 text-sm font-extrabold text-white">
                                                    ${card.basePrice.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-xs text-neutral-500">
                                                    {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => alert(`Rate Card editing is restricted.`)}
                                                        className="bg-neutral-805 hover:bg-neutral-800 text-xs px-2.5 py-1.5 border border-neutral-800 rounded font-bold transition-all cursor-pointer"
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
                        <p className="text-sm text-neutral-500 text-center py-12">No rate cards registered yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
