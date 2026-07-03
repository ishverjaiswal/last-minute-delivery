/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { createZoneSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { DEMO_DATA } from '@/lib/demo-data'
import { Sparkles, Map } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable, Skeleton } from '@/components/ui/Skeleton'

export default function ZonesPage() {
    const router = useRouter()
    const user = useCurrentUser()
    const role = user?.role

    const [zones, setZones] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [rateCards, setRateCards] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            name: '',
            city: '',
            state: '',
            pinCodesString: '',
        },
    })

    const fetchZonesData = async () => {
        try {
            const [zonesRes, ordersRes, ratesRes] = await Promise.all([
                axios.get('/api/zones'),
                axios.get('/api/orders'),
                axios.get('/api/rate-cards'),
            ])
            if (zonesRes.data.success) setZones(zonesRes.data.data)
            if (ordersRes.data.success) setOrders(ordersRes.data.data)
            if (ratesRes.data.success) setRateCards(ratesRes.data.data)
        } catch (err) {
            console.error('Error loading zones info:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (role) {
            if (role !== 'ADMIN') {
                router.push('/dashboard')
            } else {
                fetchZonesData()
            }
        }
    }, [role])

    const fillSampleZone = () => {
        setValue('name', DEMO_DATA.zone.name, { shouldValidate: true })
        setValue('city', DEMO_DATA.zone.city, { shouldValidate: true })
        setValue('state', DEMO_DATA.zone.state, { shouldValidate: true })
        setValue('pinCodesString', DEMO_DATA.zone.pinCodes, {
            shouldValidate: true,
        })
    }

    const onSubmit = async (values: any) => {
        setIsPending(true)
        setError(null)
        try {
            const pins = values.pinCodesString
                .split(',')
                .map((p: string) => p.trim())
                .filter((p: string) => p.length > 0)

            const payload = {
                name: values.name,
                city: values.city,
                state: values.state,
                pinCodes: pins,
            }

            const parsed = createZoneSchema.safeParse(payload)
            if (!parsed.success) {
                setError(
                    parsed.error.issues[0]?.message || 'Invalid validation'
                )
                setIsPending(false)
                return
            }

            const res = await axios.post('/api/zones', parsed.data)
            if (res.data.success) {
                alert('Zone registered successfully!')
                reset()
                fetchZonesData()
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
                        <SkeletonTable rows={4} cols={6} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="premium-tyo-display">
                    Geographic Service Zones
                </h1>
                <p className="premium-tyo-secondary">
                    Define logistics dispatch zones and list serviceable PIN
                    codes.
                </p>
            </div>

            {/* Split layout (Left Form / Right Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Card: Create Zone Form (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 premium-card space-y-4 h-fit">
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-between border-b border-neutral-850 pb-2">
                        <h2 className="premium-tyo-card">
                            Create Service Area
                        </h2>
                        <button
                            type="button"
                            onClick={fillSampleZone}
                            className="premium-button-secondary text-[10px] h-7 px-2 shrink-0 cursor-pointer"
                        >
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                            Fill Sample Zone
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="premium-form-group">
                            <label
                                htmlFor="name"
                                className="premium-form-label"
                            >
                                Zone Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name', { required: true })}
                                placeholder="e.g. North Kanpur"
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="city"
                                className="premium-form-label"
                            >
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="city"
                                type="text"
                                {...register('city', { required: true })}
                                placeholder="e.g. Kanpur"
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="state"
                                className="premium-form-label"
                            >
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="state"
                                type="text"
                                {...register('state', { required: true })}
                                placeholder="e.g. Uttar Pradesh"
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="pinCodesString"
                                className="premium-form-label"
                            >
                                Serviceable PIN Codes (Comma-separated){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="pinCodesString"
                                type="text"
                                {...register('pinCodesString', {
                                    required: true,
                                })}
                                placeholder="e.g. 208001, 208002"
                                disabled={isPending}
                                className="premium-input w-full font-mono"
                            />
                            <p className="premium-form-helper">
                                Provide numbers separated by commas.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="premium-button-primary w-full h-9 select-none cursor-pointer"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent animate-spin rounded-full" />
                                    Creating Zone...
                                </span>
                            ) : (
                                'Create Zone'
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Card: Zones Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-855 bg-neutral-900/50">
                        <h2 className="premium-tyo-card">
                            Active Service Zones ({zones.length})
                        </h2>
                    </div>

                    {zones.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4">Zone</th>
                                        <th className="p-4">City / State</th>
                                        <th className="p-4 font-mono">
                                            PIN Count
                                        </th>
                                        <th className="p-4">Active Orders</th>
                                        <th className="p-4">Rate Cards</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {zones.map((zone) => {
                                        let pins: string[] = []
                                        try {
                                            pins = JSON.parse(zone.pinCodes)
                                        } catch {}

                                        const zoneOrdersCount = orders.filter(
                                            (o) =>
                                                pins.includes(o.deliveryPinCode)
                                        ).length
                                        const zoneRateCardsCount =
                                            rateCards.filter(
                                                (r) => r.zoneId === zone.id
                                            ).length

                                        return (
                                            <tr
                                                key={zone.id}
                                                className="premium-table-row"
                                            >
                                                <td className="premium-table-cell font-bold text-neutral-200">
                                                    {zone.name}
                                                </td>
                                                <td className="premium-table-cell text-neutral-400 text-xs">
                                                    {zone.city}, {zone.state}
                                                </td>
                                                <td className="premium-table-cell font-mono text-indigo-400 font-bold">
                                                    {pins.length} PINs
                                                </td>
                                                <td className="premium-table-cell font-mono font-bold text-neutral-300">
                                                    {zoneOrdersCount} dispatches
                                                </td>
                                                <td className="premium-table-cell font-mono font-bold text-neutral-300">
                                                    {zoneRateCardsCount} rules
                                                </td>
                                                <td className="premium-table-action">
                                                    <button
                                                        onClick={() =>
                                                            alert(
                                                                `Zone editing or deletion is restricted.`
                                                            )
                                                        }
                                                        className="premium-button-secondary h-8 text-[10px] cursor-pointer"
                                                    >
                                                        Details
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
                            icon={Map}
                            title="No zones configured"
                            description="Create a coverage zone to link serviceable Kanpur regions."
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
