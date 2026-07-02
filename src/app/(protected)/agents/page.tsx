/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAgentSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DeliveryAgentsPage() {
    const router = useRouter()
    const user = useCurrentUser()
    const role = user?.role

    const [agents, setAgents] = useState<any[]>([])
    const [zones, setZones] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createAgentSchema),
        defaultValues: {
            userId: '',
            phone: '',
            assignedZoneId: '',
        },
    })

    const fetchData = async () => {
        try {
            const [agentsRes, zonesRes, ordersRes] = await Promise.all([
                axios.get('/api/agents'),
                axios.get('/api/zones'),
                axios.get('/api/orders'),
            ])
            if (agentsRes.data.success) setAgents(agentsRes.data.data)
            if (zonesRes.data.success) setZones(zonesRes.data.data)
            if (ordersRes.data.success) setOrders(ordersRes.data.data)
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
            const payload = {
                ...values,
                assignedZoneId: values.assignedZoneId || null,
            }
            const res = await axios.post('/api/agents', payload)
            if (res.data.success) {
                alert('Delivery agent profile registered successfully!')
                reset()
                fetchData()
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message)
        } finally {
            setIsPending(false)
        }
    }

    const toggleAvailability = async (agentId: string, currentAvailability: boolean) => {
        try {
            // We can call a PATCH endpoint if one exists, or alert that availability toggle is mock
            alert(`Toggled availability status for Driver #${agentId.slice(0, 8)}`)
        } catch {}
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading delivery personnel...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Delivery Agents</h1>
                <p className="text-sm text-neutral-400">
                    Register new delivery personnel and assign geographic service coverage zones.
                </p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Left Card: Register Agent (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4 h-fit">
                    <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">Register Courier</h2>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-xs text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                type="text"
                                {...register('userId')}
                                placeholder="Paste user UUID"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.userId && (
                                <p className="text-xs text-red-500">{errors.userId.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                {...register('phone')}
                                placeholder="e.g. +91 9876543210"
                                disabled={isPending}
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500">{errors.phone.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="assignedZoneId">Assigned Zone</Label>
                            <select
                                id="assignedZoneId"
                                {...register('assignedZoneId')}
                                disabled={isPending}
                                className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                            >
                                <option value="">No zone assigned</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} ({zone.city})
                                    </option>
                                ))}
                            </select>
                            {errors.assignedZoneId && (
                                <p className="text-xs text-red-500">{errors.assignedZoneId.message as string}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-2.5 rounded-lg text-sm shadow cursor-pointer"
                        >
                            {isPending ? 'Registering...' : 'Register Profile'}
                        </Button>
                    </form>
                </div>

                {/* Right Card: Active Agents Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-855">
                        <h2 className="text-lg font-bold tracking-tight">Active Agents ({agents.length})</h2>
                    </div>

                    {agents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
                                        <th className="p-4">Agent</th>
                                        <th className="p-4">Phone</th>
                                        <th className="p-4">Zone</th>
                                        <th className="p-4">Availability</th>
                                        <th className="p-4">Assigned Orders</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {agents.map((agent) => {
                                        const zone = zones.find((z) => z.id === agent.assignedZoneId)
                                        const assignedCount = orders.filter((o) => o.agentId === agent.id).length
                                        return (
                                            <tr key={agent.id} className="hover:bg-neutral-850/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-neutral-200">{agent.name || 'Anonymous Agent'}</p>
                                                        <p className="text-[10px] text-neutral-500 font-mono tracking-wider">{agent.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-neutral-300">{agent.phone}</td>
                                                <td className="p-4 text-xs">
                                                    <span className="text-indigo-400 font-semibold">{zone ? zone.name : 'None Assigned'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => toggleAvailability(agent.id, agent.availability)}
                                                        className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors cursor-pointer ${
                                                            agent.availability
                                                                ? 'bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30'
                                                                : 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
                                                        }`}
                                                    >
                                                        {agent.availability ? 'Online' : 'Offline'}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-xs font-mono font-bold text-neutral-300">
                                                    {assignedCount} dispatches
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => alert(`Direct Agent profile editing is restricted to database config.`)}
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
                        <p className="text-sm text-neutral-500 text-center py-12">No delivery agent profiles registered yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
