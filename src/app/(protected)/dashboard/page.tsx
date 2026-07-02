/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
    const user = useCurrentUser()
    const role = user?.role

    const [orders, setOrders] = useState<any[]>([])
    const [agents, setAgents] = useState<any[]>([])
    const [zones, setZones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersRes = await axios.get('/api/orders')
                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.data)
                }

                if (role === 'ADMIN') {
                    const [agentsRes, zonesRes] = await Promise.all([
                        axios.get('/api/agents'),
                        axios.get('/api/zones'),
                    ])
                    if (agentsRes.data.success) setAgents(agentsRes.data.data)
                    if (zonesRes.data.success) setZones(zonesRes.data.data)
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        if (role) {
            fetchData()
        }
    }, [role])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading dashboard...</p>
            </div>
        )
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

    if (role === 'ADMIN') {
        const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
        const totalSales = orders.filter((o) => o.status === 'DELIVERED').reduce((acc, o) => acc + o.price, 0)

        return (
            <div className="w-full max-w-6xl space-y-8 px-4 text-white">
                {/* Welcome Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Console</h1>
                    <p className="text-neutral-400 text-sm">
                        Monitor and manage last-mile deliveries, drivers, service coverage, and pricing cards.
                    </p>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Active Deliveries</span>
                            <span className="text-lg">📦</span>
                        </div>
                        <p className="text-3xl font-extrabold">{activeOrdersCount}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Delivery Personnel</span>
                            <span className="text-lg">🛵</span>
                        </div>
                        <p className="text-3xl font-extrabold">{agents.length}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Coverage Zones</span>
                            <span className="text-lg">🗺️</span>
                        </div>
                        <p className="text-3xl font-extrabold">{zones.length}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Delivered Volume</span>
                            <span className="text-lg">💵</span>
                        </div>
                        <p className="text-3xl font-extrabold">${totalSales.toFixed(2)}</p>
                    </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-bold tracking-tight">Logistics Operations Shortcuts</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/zones" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                    <span className="text-xl mb-1">🗺️</span>
                                    <span className="text-xs font-bold text-neutral-200">Manage Zones</span>
                                </Link>
                                <Link href="/rate-cards" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                    <span className="text-xl mb-1">💳</span>
                                    <span className="text-xs font-bold text-neutral-200">Manage Pricing</span>
                                </Link>
                                <Link href="/agents" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                    <span className="text-xl mb-1">🛵</span>
                                    <span className="text-xs font-bold text-neutral-200">Manage Agents</span>
                                </Link>
                                <Link href="/orders" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                    <span className="text-xl mb-1">📦</span>
                                    <span className="text-xs font-bold text-neutral-200">Manage Orders</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-neutral-900 border border-neutral-855 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-neutral-850 flex justify-between items-center">
                                <h2 className="text-lg font-bold tracking-tight">Recent Dispatch Requests</h2>
                                <Link href="/orders" className="text-xs text-indigo-400 hover:underline font-semibold">
                                    View all orders
                                </Link>
                            </div>

                            {orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
                                                <th className="p-4">Order ID</th>
                                                <th className="p-4">Destination PIN</th>
                                                <th className="p-4">Weight (kg)</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-850">
                                            {orders.slice(0, 5).map((order) => (
                                                <tr key={order.id} className="hover:bg-neutral-850/20 transition-colors">
                                                    <td className="p-4 font-bold text-xs tracking-wide">{order.id.slice(0, 8)}...</td>
                                                    <td className="p-4 font-mono text-xs">{order.deliveryPinCode}</td>
                                                    <td className="p-4 text-xs">{order.weight} kg</td>
                                                    <td className="p-4">
                                                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Link href={`/orders/${order.id}`} className="bg-neutral-800 hover:bg-neutral-750 text-xs px-2.5 py-1.5 border border-neutral-700 rounded font-bold transition-colors">
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500 text-center py-8">No order requests found.</p>
                            )}
                        </div>
                    </div>

                    {/* Right 1 Column */}
                    <div className="space-y-8 lg:col-span-1">
                        {/* Service Zone Summary */}
                        <div className="bg-neutral-900 border border-neutral-855 rounded-xl p-6 space-y-4">
                            <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-400">Coverage Zone Overview</h2>
                            <div className="space-y-3">
                                {zones.slice(0, 4).map((zone) => {
                                    let pins: string[] = []
                                    try {
                                        pins = JSON.parse(zone.pinCodes)
                                    } catch {}
                                    return (
                                        <div key={zone.id} className="flex justify-between items-center py-1 border-b border-neutral-850 last:border-b-0">
                                            <div>
                                                <p className="text-xs font-bold text-neutral-200">{zone.name}</p>
                                                <p className="text-[10px] text-neutral-500">{zone.city}</p>
                                            </div>
                                            <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                                                {pins.length} PINs
                                            </span>
                                        </div>
                                    )
                                })}
                                {zones.length === 0 && <p className="text-xs text-neutral-500">No coverage zones configured.</p>}
                            </div>
                        </div>

                        {/* Recent Agent Activity */}
                        <div className="bg-neutral-900 border border-neutral-855 rounded-xl p-6 space-y-4">
                            <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-400">Active Personnel Status</h2>
                            <div className="space-y-4">
                                {agents.slice(0, 5).map((agent) => {
                                    const activeZone = zones.find((z) => z.id === agent.assignedZoneId)
                                    return (
                                        <div key={agent.id} className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-neutral-200">{agent.name || 'Anonymous Agent'}</p>
                                                <p className="text-[10px] text-neutral-500">{activeZone ? activeZone.name : 'No Zone Assigned'}</p>
                                            </div>
                                            <Badge className={agent.availability ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}>
                                                {agent.availability ? 'Online' : 'Offline'}
                                            </Badge>
                                        </div>
                                    )
                                })}
                                {agents.length === 0 && <p className="text-xs text-neutral-500">No drivers registered yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (role === 'DELIVERY_AGENT') {
        const assignedDeliveries = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')

        return (
            <div className="w-full max-w-4xl space-y-8 px-4 text-white">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Driver Task list</h1>
                    <p className="text-neutral-400">Manage and update status of packages assigned to your delivery zone.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold">Your Active Task list ({assignedDeliveries.length})</h2>
                    <div className="space-y-4">
                        {assignedDeliveries.map((order) => (
                            <div key={order.id} className="p-4 bg-neutral-850 border border-neutral-800 rounded-xl space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-bold">Order ID: {order.id.slice(0, 8)}</p>
                                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                        </div>
                                        <p className="text-xs text-neutral-400">Pickup: {order.pickupAddress}</p>
                                        <p className="text-xs text-neutral-400">Delivery: {order.deliveryAddress} ({order.deliveryPinCode})</p>
                                    </div>
                                    <p className="text-lg font-bold">${order.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/50">
                                    <Link href={`/orders/${order.id}`} className="text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-2 rounded font-medium transition-colors">
                                        View Details
                                    </Link>
                                    {order.status === 'ASSIGNED' && (
                                        <button
                                            onClick={async () => {
                                                await axios.patch(`/api/orders/${order.id}`, { status: 'PICKED_UP' })
                                                window.location.reload()
                                            }}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded font-bold transition-colors cursor-pointer"
                                        >
                                            Mark Picked Up
                                        </button>
                                    )}
                                    {order.status === 'PICKED_UP' && (
                                        <button
                                            onClick={async () => {
                                                await axios.patch(`/api/orders/${order.id}`, { status: 'OUT_FOR_DELIVERY' })
                                                window.location.reload()
                                            }}
                                            className="text-xs bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded font-bold transition-colors cursor-pointer"
                                        >
                                            Mark Out For Delivery
                                        </button>
                                    )}
                                    {order.status === 'OUT_FOR_DELIVERY' && (
                                        <button
                                            onClick={async () => {
                                                await axios.patch(`/api/orders/${order.id}`, { status: 'DELIVERED' })
                                                window.location.reload()
                                            }}
                                            className="text-xs bg-green-600 hover:bg-green-700 px-3 py-2 rounded font-bold transition-colors cursor-pointer"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {assignedDeliveries.length === 0 && (
                            <p className="text-sm text-neutral-500 text-center py-8">Great job! You have no active assignments right now.</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Default Customer Panel
    const activeParcels = orders.filter((o) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status))
    const pendingParcels = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status))
    const deliveredParcels = orders.filter((o) => o.status === 'DELIVERED')

    const activities = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((order) => {
            const shortId = order.id.slice(0, 8)
            const time = new Date(order.createdAt).toLocaleDateString()
            let text = `Order #${shortId} booked`
            if (order.status === 'DELIVERED') text = `Order #${shortId} delivered`
            else if (order.status === 'OUT_FOR_DELIVERY') text = `Order #${shortId} out for delivery`
            else if (order.status === 'PICKED_UP') text = `Order #${shortId} picked up by agent`
            else if (order.status === 'ASSIGNED') text = `Order #${shortId} assigned to agent`
            else if (order.status === 'CONFIRMED') text = `Order #${shortId} confirmed by Admin`
            else if (order.status === 'CANCELLED') text = `Order #${shortId} cancelled`
            return { text, time, status: order.status }
        })

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Top Welcome Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.name || 'Customer'} 👋
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Manage your deliveries and monitor shipment activity.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/orders/create" className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md cursor-pointer">
                        Book Delivery
                    </Link>
                    <Link href="/orders" className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer">
                        View Orders
                    </Link>
                </div>
            </div>

            {/* KPI Metrics Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                        <span className="text-lg">📦</span>
                    </div>
                    <p className="text-3xl font-extrabold">{orders.length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Pending Deliveries</span>
                        <span className="text-lg">⏳</span>
                    </div>
                    <p className="text-3xl font-extrabold">{pendingParcels.length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Delivered Orders</span>
                        <span className="text-lg">✅</span>
                    </div>
                    <p className="text-3xl font-extrabold">{deliveredParcels.length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-neutral-400">
                        <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
                        <span className="text-lg">🚚</span>
                    </div>
                    <p className="text-3xl font-extrabold">{activeParcels.length}</p>
                </div>
            </div>

            {/* Main Content Layout columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns (Quick Actions & Recent Orders Table) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions Panel */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/orders/create" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                <span className="text-xl mb-1">📦</span>
                                <span className="text-xs font-bold text-neutral-200">Book Delivery</span>
                            </Link>
                            <Link href="/orders" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                <span className="text-xl mb-1">📋</span>
                                <span className="text-xs font-bold text-neutral-200">View Orders</span>
                            </Link>
                            {orders.length > 0 ? (
                                <Link href={`/orders/${orders[0].id}`} className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors">
                                    <span className="text-xl mb-1">🔍</span>
                                    <span className="text-xs font-bold text-neutral-200">Track Shipment</span>
                                </Link>
                            ) : (
                                <button onClick={() => alert('No active shipments to track yet.')} className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors cursor-pointer">
                                    <span className="text-xl mb-1">🔍</span>
                                    <span className="text-xs font-bold text-neutral-200">Track Shipment</span>
                                </button>
                            )}
                            <button
                                onClick={() => alert('Invoice download triggered for recent deliveries.')}
                                className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-colors cursor-pointer"
                            >
                                <span className="text-xl mb-1">💵</span>
                                <span className="text-xs font-bold text-neutral-200">Download Invoice</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-855 flex justify-between items-center">
                            <h2 className="text-lg font-bold tracking-tight">Recent Orders</h2>
                            {orders.length > 0 && (
                                <Link href="/orders" className="text-xs text-indigo-400 hover:underline font-semibold">
                                    View all dispatches
                                </Link>
                            )}
                        </div>

                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Destination</th>
                                            <th className="p-4">Assigned Agent</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Created</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-850">
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order.id} className="hover:bg-neutral-850/20 transition-colors">
                                                <td className="p-4 font-bold text-xs tracking-wide">
                                                    {order.id.slice(0, 8)}...
                                                </td>
                                                <td className="p-4 text-xs max-w-[120px] truncate">
                                                    {order.deliveryAddress} ({order.deliveryPinCode})
                                                </td>
                                                <td className="p-4 text-xs text-neutral-400">
                                                    {order.agentId ? `Agent #${order.agentId.slice(0, 8)}` : 'Unassigned'}
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                                </td>
                                                <td className="p-4 text-xs text-neutral-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link href={`/orders/${order.id}`} className="bg-neutral-800 hover:bg-neutral-750 text-xs px-2.5 py-1.5 border border-neutral-700 rounded font-bold transition-colors">
                                                        Track
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 space-y-4">
                                <p className="text-neutral-500 text-sm">No deliveries yet</p>
                                <Link href="/orders/create" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-xs px-4 py-2 rounded-md font-bold transition-colors">
                                    Book Delivery
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Recent Activity Panel Timeline) */}
                <div className="lg:col-span-1 bg-neutral-900 border border-neutral-855 rounded-xl p-6 h-fit space-y-6">
                    <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
                    
                    {activities.length > 0 ? (
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                            {activities.map((act, idx) => (
                                <div key={`act-${idx}`} className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-xs z-10 shrink-0 mt-0.5 font-bold">
                                        ✓
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-neutral-200 leading-normal">{act.text}</p>
                                        <p className="text-[10px] text-neutral-500 font-medium">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-500 py-4 text-center">No activity logged yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
