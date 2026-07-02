/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const user = useCurrentUser()
    const role = user?.role

    const [order, setOrder] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [agents, setAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Admin state inputs
    const [selectedAgent, setSelectedAgent] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    const fetchOrderDetail = async () => {
        try {
            const [orderRes, historyRes] = await Promise.all([
                axios.get(`/api/orders/${params.id}`),
                axios.get(`/api/orders/${params.id}/history`),
            ])
            if (orderRes.data.success) {
                const orderData = orderRes.data.data
                setOrder(orderData)
                setSelectedStatus(orderData.status)
                setSelectedAgent(orderData.agentId || '')
            }
            if (historyRes.data.success) {
                setHistory(historyRes.data.data)
            }

            if (role === 'ADMIN') {
                const agentsRes = await axios.get('/api/agents')
                if (agentsRes.data.success) {
                    setAgents(agentsRes.data.data)
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (role && params.id) {
            fetchOrderDetail()
        }
    }, [role, params.id])

    const handleAssignAgent = async () => {
        try {
            const res = await axios.patch(`/api/orders/${params.id}`, {
                agentId: selectedAgent || null,
            })
            if (res.data.success) {
                alert('Courier assignment updated successfully!')
                fetchOrderDetail()
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to assign agent')
        }
    }

    const handleStatusTransition = async (statusOverride?: string) => {
        const targetStatus = statusOverride || selectedStatus
        try {
            const res = await axios.patch(`/api/orders/${params.id}`, {
                status: targetStatus,
            })
            if (res.data.success) {
                alert(`Order status transitioned to ${targetStatus}`)
                fetchOrderDetail()
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to update order status')
        }
    }

    // Address & details parser helper
    const parseAddressDetails = (addressStr: string) => {
        if (!addressStr) return { name: 'N/A', phone: 'N/A', address: 'N/A' }
        const match = addressStr.match(/^(.*?)\s*\((.*?)\)\s*-\s*(.*)$/)
        if (match) {
            return { name: match[1], phone: match[2], address: match[3] }
        }
        return { name: 'Standard Custody', phone: 'Not Listed', address: addressStr }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
            case 'CONFIRMED':
                return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
            case 'ASSIGNED':
                return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50'
            case 'PICKED_UP':
                return 'bg-purple-500/20 text-purple-500 border-purple-500/50'
            case 'OUT_FOR_DELIVERY':
                return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
            case 'DELIVERED':
                return 'bg-green-500/20 text-green-500 border-green-500/50'
            case 'CANCELLED':
                return 'bg-red-500/20 text-red-500 border-red-500/50'
            default:
                return 'bg-neutral-500/20 text-neutral-500 border-neutral-500/50'
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading order info...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="w-full max-w-lg mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-4 text-center text-white">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Order</h1>
                <p className="text-neutral-400">{error || 'Order record not found.'}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    // Parse sender/recipient
    const pickupInfo = parseAddressDetails(order.pickupAddress)
    const deliveryInfo = parseAddressDetails(order.deliveryAddress)

    // Timeline Configuration
    const timelineStates = [
        { label: 'Order Created', key: 'PENDING' },
        { label: 'Confirmed', key: 'CONFIRMED' },
        { label: 'Assigned', key: 'ASSIGNED' },
        { label: 'Picked Up', key: 'PICKED_UP' },
        { label: 'Out For Delivery', key: 'OUT_FOR_DELIVERY' },
        { label: 'Delivered', key: 'DELIVERED' },
    ]

    const currentStatusIndex = timelineStates.findIndex((s) => s.key === order.status)
    const allStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

    const getTimelineTimestamp = (statusKey: string) => {
        const found = history.find((h) => h.status === statusKey)
        if (!found) return null
        return new Date(found.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Get current assigned agent profile or placeholder
    const assignedAgentObj = agents.find((a) => a.id === order.agentId)

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* SECTION 1: PAGE HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-neutral-900 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="text-neutral-500 text-xs font-bold font-mono tracking-widest">SHIPMENT</span>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            LMD-{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <Badge className={`${getStatusColor(order.status)} text-xs font-bold border px-2 py-0.5 rounded`}>
                            {order.status}
                        </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                        Sender: <span className="font-bold text-neutral-200">{pickupInfo.name}</span> • Created:{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/orders')}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                    >
                        Back to Orders
                    </button>
                    <button
                        onClick={() => alert('Tracking map initialized (Mock).')}
                        className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow cursor-pointer"
                    >
                        Track Shipment
                    </button>
                </div>
            </div>

            {/* Main Details Grid - Two Columns (70% / 30%) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Left Side (70%) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* SECTION 2: SHIPMENT SUMMARY CARD */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            Shipment Overview
                        </h2>

                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            {/* Route Path */}
                            <div className="space-y-6 md:w-1/2">
                                <div className="space-y-1">
                                    <p className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                                        Pickup Address
                                    </p>
                                    <p className="text-sm font-bold text-neutral-200">{pickupInfo.name}</p>
                                    <p className="text-xs text-neutral-400">{pickupInfo.phone}</p>
                                    <p className="text-xs text-neutral-400">{pickupInfo.address}</p>
                                </div>
                                <div className="text-neutral-600 font-bold pl-2">↓</div>
                                <div className="space-y-1">
                                    <p className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                                        Delivery Address
                                    </p>
                                    <p className="text-sm font-bold text-neutral-200">{deliveryInfo.name}</p>
                                    <p className="text-xs text-neutral-400">{deliveryInfo.phone}</p>
                                    <p className="text-xs text-neutral-400">{deliveryInfo.address}</p>
                                    <p className="text-xs text-neutral-400 font-mono">PIN: {order.deliveryPinCode}</p>
                                </div>
                            </div>

                            {/* Meta Metrics */}
                            <div className="grid grid-cols-2 gap-4 md:w-1/2 text-sm h-fit">
                                <div className="space-y-1 border-l border-neutral-800 pl-4">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                                        Weight
                                    </span>
                                    <p className="font-bold text-neutral-200">{order.weight} kg</p>
                                </div>
                                <div className="space-y-1 border-l border-neutral-800 pl-4">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                                        Category
                                    </span>
                                    <p className="font-bold text-neutral-200">Clothing</p>
                                </div>
                                <div className="space-y-1 border-l border-neutral-800 pl-4">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                                        Pricing Paid
                                    </span>
                                    <p className="font-extrabold text-indigo-400">${order.price.toFixed(2)}</p>
                                </div>
                                <div className="space-y-1 border-l border-neutral-800 pl-4">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                                        Est. Delivery
                                    </span>
                                    <p className="font-bold text-neutral-200">2-3 Business Days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: HERO STATUS TIMELINE */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            Shipment Timeline
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
                            {timelineStates.map((state, idx) => {
                                const isCompleted = idx < currentStatusIndex || order.status === 'DELIVERED'
                                const isCurrent = idx === currentStatusIndex && order.status !== 'DELIVERED'
                                const timestamp = getTimelineTimestamp(state.key)

                                let circleColor = 'border-neutral-800 bg-neutral-950 text-neutral-500'
                                let textColor = 'text-neutral-500'
                                if (isCompleted) {
                                    circleColor = 'border-green-500 bg-green-500/10 text-green-500'
                                    textColor = 'text-green-500 font-bold'
                                } else if (isCurrent) {
                                    circleColor = 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                    textColor = 'text-indigo-400 font-extrabold'
                                }

                                return (
                                    <div
                                        key={`timeline-${idx}`}
                                        className="flex md:flex-col items-center md:text-center gap-4 md:gap-2 relative"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 ${circleColor}`}
                                        >
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <div className="space-y-1 md:text-center">
                                            <p className={`text-xs ${textColor}`}>{state.label}</p>
                                            {timestamp && (
                                                <p className="text-[10px] text-neutral-500 font-medium">{timestamp}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* SECTION 5: RECENT ACTIVITY */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            Activity Log
                        </h2>

                        {history.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                                {history
                                    .slice()
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((step) => (
                                        <div key={step.id} className="flex gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-xs z-10 shrink-0 mt-0.5 font-bold">
                                                ✓
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(step.status)}>{step.status}</Badge>
                                                    {step.changedByName && (
                                                        <span className="text-xs text-neutral-400">
                                                            by {step.changedByName}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-neutral-500 font-medium">
                                                    {new Date(step.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500 py-6 text-center">
                                No shipment updates available yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side (30%) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* SECTION 6: DELIVERY SUMMARY */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-400">
                            Current Delivery Status
                        </h2>
                        <div className="space-y-3">
                            <Badge className={`${getStatusColor(order.status)} font-extrabold w-full text-center py-2`}>
                                {order.status}
                            </Badge>
                            <div className="space-y-1 text-xs text-neutral-400 pt-2 border-t border-neutral-850">
                                <div className="flex justify-between">
                                    <span>Pricing</span>
                                    <span className="font-bold text-neutral-200">${order.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Weight Bracket</span>
                                    <span className="font-bold text-neutral-200">{order.weight} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Est. Arrival</span>
                                    <span className="font-bold text-neutral-200">2-3 Business Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: ASSIGNED DELIVERY AGENT */}
                    <div className="bg-neutral-900 border border-neutral-855 rounded-xl p-6 space-y-4">
                        <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-400">
                            Delivery Agent Details
                        </h2>

                        {order.agentId ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-lg font-bold">
                                        🛵
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-neutral-200">
                                            {assignedAgentObj?.name || 'Rahul Sharma'}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-medium">
                                            {assignedAgentObj?.phone || '+91 98765 43210'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-neutral-400 border-t border-neutral-850 pt-3">
                                    <div className="flex justify-between">
                                        <span>Current Status</span>
                                        <span className="text-emerald-500 font-bold">Online</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Assigned Zone</span>
                                        <span className="text-neutral-200 font-semibold">Kanpur Zone</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-2">
                                <p className="text-xs text-neutral-500">Waiting for assignment.</p>
                            </div>
                        )}
                    </div>

                    {/* SECTION 7: ROLE-BASED QUICK ACTIONS */}
                    <div className="bg-neutral-900 border border-neutral-855 rounded-xl p-6 space-y-4">
                        <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-400">
                            Operation Actions
                        </h2>

                        {/* Customer Mode */}
                        {role === 'CUSTOMER' && (
                            <div className="space-y-3">
                                {order.status === 'PENDING' ? (
                                    <button
                                        onClick={() => handleStatusTransition('CANCELLED')}
                                        className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Cancel Shipment Booking
                                    </button>
                                ) : (
                                    <p className="text-xs text-neutral-500 text-center py-2">
                                        Shipment locked. Cancellations disabled.
                                    </p>
                                )}
                                <button
                                    onClick={() => alert('Support desk ticket created!')}
                                    className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                    Contact Support
                                </button>
                            </div>
                        )}

                        {/* Delivery Driver Agent Mode */}
                        {role === 'DELIVERY_AGENT' && (
                            <div className="space-y-3">
                                {order.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => handleStatusTransition('PICKED_UP')}
                                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Mark Picked Up
                                    </button>
                                )}
                                {order.status === 'PICKED_UP' && (
                                    <button
                                        onClick={() => handleStatusTransition('OUT_FOR_DELIVERY')}
                                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-750 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Mark Out For Delivery
                                    </button>
                                )}
                                {order.status === 'OUT_FOR_DELIVERY' && (
                                    <button
                                        onClick={() => handleStatusTransition('DELIVERED')}
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-750 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                                {['DELIVERED', 'CANCELLED'].includes(order.status) && (
                                    <p className="text-xs text-neutral-500 text-center py-2">
                                        No active driver transitions available.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Dispatcher Admin Mode */}
                        {role === 'ADMIN' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="agentAssign" className="text-xs text-neutral-400 font-bold">
                                        Assign Agent
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="agentAssign"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                            className="flex-1 h-9 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-xs text-white"
                                        >
                                            <option value="">Unassigned</option>
                                            {agents.map((agent) => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.name || 'Agent'} ({agent.phone})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssignAgent}
                                            className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 border-t border-neutral-850 pt-3">
                                    <label htmlFor="statusOverride" className="text-xs text-neutral-400 font-bold">
                                        Status Override
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="statusOverride"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="flex-1 h-9 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-xs text-white"
                                        >
                                            {allStatuses.map((st) => (
                                                <option key={st} value={st}>
                                                    {st}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleStatusTransition()}
                                            className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
