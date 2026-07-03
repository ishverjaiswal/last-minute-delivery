/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAgentSchema } from '@/lib/schema/delivery.schema'
import axios from 'axios'
import { DEMO_DATA } from '@/lib/demo-data'
import { Sparkles, Bike } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable, Skeleton } from '@/components/ui/Skeleton'

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
        setValue,
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

    const fillSampleAgent = () => {
        setValue('userId', DEMO_DATA.agent.userId, { shouldValidate: true })
        setValue('phone', DEMO_DATA.agent.phone, { shouldValidate: true })
        if (zones && zones.length > 0) {
            setValue('assignedZoneId', zones[0].id, { shouldValidate: true })
        }
    }

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

    const toggleAvailability = async (
        agentId: string,
        currentAvailability: boolean
    ) => {
        try {
            alert(
                `Toggled availability status for Driver #${agentId.slice(0, 8)}`
            )
        } catch {}
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
                <h1 className="premium-tyo-display">Delivery Agents</h1>
                <p className="premium-tyo-secondary">
                    Register new delivery personnel and assign geographic
                    service coverage zones.
                </p>
            </div>

            {/* Split layout (Left Form / Right Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Card: Register Agent (30% equivalent / col-span-3) */}
                <div className="lg:col-span-3 premium-card space-y-4 h-fit">
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-between border-b border-neutral-850 pb-2">
                        <h2 className="premium-tyo-card">Register Courier</h2>
                        <button
                            type="button"
                            onClick={fillSampleAgent}
                            className="premium-button-secondary text-[10px] h-7 px-2 shrink-0 cursor-pointer"
                        >
                            <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                            Fill Sample Agent
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
                                htmlFor="userId"
                                className="premium-form-label"
                            >
                                User ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="userId"
                                type="text"
                                {...register('userId')}
                                placeholder="Paste user UUID"
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                            {errors.userId && (
                                <p className="premium-form-error">
                                    {errors.userId.message as string}
                                </p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="phone"
                                className="premium-form-label"
                            >
                                Phone Number{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                type="text"
                                {...register('phone')}
                                placeholder="e.g. +91 9876543210"
                                disabled={isPending}
                                className="premium-input w-full"
                            />
                            {errors.phone && (
                                <p className="premium-form-error">
                                    {errors.phone.message as string}
                                </p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="assignedZoneId"
                                className="premium-form-label"
                            >
                                Assigned Zone
                            </label>
                            <select
                                id="assignedZoneId"
                                {...register('assignedZoneId')}
                                disabled={isPending}
                                className="premium-input w-full h-[2.25rem] bg-neutral-950 text-white"
                            >
                                <option value="">No zone assigned</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} ({zone.city})
                                    </option>
                                ))}
                            </select>
                            {errors.assignedZoneId && (
                                <p className="premium-form-error">
                                    {errors.assignedZoneId.message as string}
                                </p>
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
                                    Registering...
                                </span>
                            ) : (
                                'Register Profile'
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Card: Active Agents Table (70% equivalent / col-span-7) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-neutral-855 bg-neutral-900/50">
                        <h2 className="premium-tyo-card">
                            Active Agents ({agents.length})
                        </h2>
                    </div>

                    {agents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4">Agent</th>
                                        <th className="p-4">Phone</th>
                                        <th className="p-4">Zone</th>
                                        <th className="p-4">Availability</th>
                                        <th className="p-4">Assigned Orders</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {agents.map((agent) => {
                                        const zone = zones.find(
                                            (z) => z.id === agent.assignedZoneId
                                        )
                                        const assignedCount = orders.filter(
                                            (o) => o.agentId === agent.id
                                        ).length
                                        return (
                                            <tr
                                                key={agent.id}
                                                className="premium-table-row"
                                            >
                                                <td className="premium-table-cell">
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-neutral-200">
                                                            {agent.name ||
                                                                'Anonymous Agent'}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-500 font-mono tracking-wider">
                                                            {agent.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="premium-table-cell font-mono text-neutral-300">
                                                    {agent.phone}
                                                </td>
                                                <td className="premium-table-cell">
                                                    <span className="text-indigo-400 font-semibold">
                                                        {zone
                                                            ? zone.name
                                                            : 'None Assigned'}
                                                    </span>
                                                </td>
                                                <td className="premium-table-cell">
                                                    <button
                                                        onClick={() =>
                                                            toggleAvailability(
                                                                agent.id,
                                                                agent.availability
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        <StatusBadge
                                                            status={
                                                                agent.availability
                                                                    ? 'ONLINE'
                                                                    : 'OFFLINE'
                                                            }
                                                        />
                                                    </button>
                                                </td>
                                                <td className="premium-table-cell font-mono font-bold text-neutral-300">
                                                    {assignedCount} dispatches
                                                </td>
                                                <td className="premium-table-action">
                                                    <button
                                                        onClick={() =>
                                                            alert(
                                                                `Direct Agent profile editing is restricted to database config.`
                                                            )
                                                        }
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
                            icon={Bike}
                            title="No agents registered"
                            description="Create an agent profile to begin dispatch assignments."
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
