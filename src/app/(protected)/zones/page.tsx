/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { createZoneSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
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
                fetchZonesData()
            }
        }
    }, [role])

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
                setError(parsed.error.issues[0]?.message || 'Invalid validation')
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading service zones...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Geographic Service Zones</h1>
                <p className="text-sm text-neutral-400">Define logistics dispatch zones and list serviceable PIN codes.</p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Left Card: Create Zone Form (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4 h-fit">
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">Create Service Area</h2>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-xs text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Zone Name</Label>
                            <Input
                                id="name"
                                type="text"
                                {...register('name', { required: true })}
                                placeholder="e.g. North Delhi"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                type="text"
                                {...register('city', { required: true })}
                                placeholder="e.g. New Delhi"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                type="text"
                                {...register('state', { required: true })}
                                placeholder="e.g. Delhi"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="pinCodesString">Serviceable PIN Codes (Comma-separated)</Label>
                            <Input
                                id="pinCodesString"
                                type="text"
                                {...register('pinCodesString', { required: true })}
                                placeholder="e.g. 110001, 110002"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm font-mono"
                            />
                            <p className="text-[10px] text-neutral-500">Provide numbers separated by commas.</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-2.5 rounded-lg text-sm shadow cursor-pointer"
                        >
                            {isPending ? 'Registering...' : 'Create Zone'}
                        </Button>
                    </form>
                </div>

                {/* Right Card: Zones Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-855">
                        <h2 className="text-lg font-bold tracking-tight">Active Service Zones ({zones.length})</h2>
                    </div>

                    {zones.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
                                        <th className="p-4">Zone</th>
                                        <th className="p-4">City / State</th>
                                        <th className="p-4 font-mono">PIN Count</th>
                                        <th className="p-4">Active Orders</th>
                                        <th className="p-4">Rate Cards</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {zones.map((zone) => {
                                        let pins: string[] = []
                                        try {
                                            pins = JSON.parse(zone.pinCodes)
                                        } catch {}

                                        // Count active orders serviced by this zone's PIN list
                                        const zoneOrdersCount = orders.filter((o) => pins.includes(o.deliveryPinCode)).length
                                        // Count pricing rate cards set up for this zone
                                        const zoneRateCardsCount = rateCards.filter((r) => r.zoneId === zone.id).length

                                        return (
                                            <tr key={zone.id} className="hover:bg-neutral-850/20 transition-colors">
                                                <td className="p-4 font-bold text-neutral-200">{zone.name}</td>
                                                <td className="p-4 text-xs text-neutral-400">
                                                    {zone.city}, {zone.state}
                                                </td>
                                                <td className="p-4 font-mono text-xs text-indigo-400 font-bold">
                                                    {pins.length} PINs
                                                </td>
                                                <td className="p-4 text-xs font-mono font-bold text-neutral-300">
                                                    {zoneOrdersCount} dispatches
                                                </td>
                                                <td className="p-4 text-xs font-mono font-bold text-neutral-300">
                                                    {zoneRateCardsCount} rules
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => alert(`Zone editing or deletion is restricted.`)}
                                                        className="bg-neutral-805 hover:bg-neutral-800 text-xs px-2.5 py-1.5 border border-neutral-800 rounded font-bold transition-all cursor-pointer"
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
                        <p className="text-sm text-neutral-500 text-center py-12">No logistics service zones registered yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
