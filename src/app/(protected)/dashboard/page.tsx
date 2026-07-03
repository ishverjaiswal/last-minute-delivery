/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'
import axios from 'axios'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton, SkeletonMetrics, SkeletonTable } from '@/components/ui/Skeleton'
import { PremiumDialog } from '@/components/ui/PremiumDialog'
import { PremiumButton } from '@/components/ui/PremiumButton'
import {
    Package, 
    Bike, 
    Map, 
    DollarSign, 
    Clock, 
    CheckCircle, 
    Truck, 
    User, 
    FileText, 
    Zap,
    Search,
} from 'lucide-react'

export default function DashboardPage() {
    const user = useCurrentUser()
    const role = user?.role

    const [orders, setOrders] = useState<any[]>([])
    const [agents, setAgents] = useState<any[]>([])
    const [zones, setZones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [scanModalOpen, setScanModalOpen] = useState(false)
    const [scanValue, setScanValue] = useState('')
    const [scanError, setScanError] = useState<string | null>(null)

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setScanError(null)
        const target = scanValue.trim().toLowerCase()
        if (!target) return

        const match = orders.find(
            (o) => o.id.toLowerCase().includes(target) || 
                   o.id.slice(0, 8).toLowerCase().includes(target)
        )

        if (match) {
            setScanModalOpen(false)
            setScanValue('')
            window.location.href = `/orders/${match.id}`
        } else {
            setScanError('No matching active delivery found. Make sure the ID is correct.')
        }
    }

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

    useEffect(() => {
        if (role) {
            fetchData()
        }
    }, [role])

    if (loading) {
        return (
            <div className="w-full max-w-6xl space-y-6 px-4">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <SkeletonMetrics count={4} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card space-y-4">
                            <Skeleton className="h-5 w-36" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                        <SkeletonTable rows={3} cols={5} />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="premium-card space-y-4 h-64">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================================================
    // 1. ADMIN OPERATIONS DASHBOARD (70 / 30 LAYOUT)
    // ==========================================================================
    if (role === 'ADMIN') {
        const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
        const totalSales = orders.filter((o) => o.status === 'DELIVERED').reduce((acc, o) => acc + o.price, 0)

        return (
            <div className="w-full max-w-6xl space-y-6 px-4 text-white">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="premium-tyo-display">Operations Console</h1>
                    <p className="premium-tyo-secondary">
                        Monitor and dispatch Kanpur last-mile deliveries, drivers, and service pricing rules.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="premium-card flex flex-col justify-between h-24">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="premium-tyo-caption">Active Shipments</span>
                            <Package className="w-[18px] h-[18px] text-neutral-500" />
                        </div>
                        <p className="text-2xl font-bold">{activeOrdersCount}</p>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-24">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="premium-tyo-caption">Active Couriers</span>
                            <Bike className="w-[18px] h-[18px] text-neutral-500" />
                        </div>
                        <p className="text-2xl font-bold">{agents.length}</p>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-24">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="premium-tyo-caption">Kanpur Zones</span>
                            <Map className="w-[18px] h-[18px] text-neutral-500" />
                        </div>
                        <p className="text-2xl font-bold">{zones.length}</p>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-24">
                        <div className="flex justify-between items-center text-neutral-400">
                            <span className="premium-tyo-caption">Total Volume</span>
                            <DollarSign className="w-[18px] h-[18px] text-neutral-500" />
                        </div>
                        <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                    </div>
                </div>

                {/* Grid layout (70 / 30 split) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left main pane (70%) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Shortcuts */}
                        <div className="premium-card space-y-4">
                            <h2 className="premium-tyo-card">Operations Shortcuts</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/zones" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                    <Map className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Manage Zones</span>
                                </Link>
                                <Link href="/rate-cards" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                    <DollarSign className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Pricing Cards</span>
                                </Link>
                                <Link href="/agents" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                    <Bike className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Manage Agents</span>
                                </Link>
                                <Link href="/orders" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                    <Package className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Manage Orders</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-neutral-855 flex justify-between items-center bg-neutral-900/50">
                                <h2 className="premium-tyo-card">Recent Dispatch Requests</h2>
                                <Link href="/orders" className="text-xs text-indigo-400 hover:underline font-semibold">
                                    View all orders
                                </Link>
                            </div>

                            {orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="premium-table">
                                        <thead>
                                            <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                                                <th className="p-4">Order ID</th>
                                                <th className="p-4">Destination PIN</th>
                                                <th className="p-4">Weight</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-850">
                                            {orders.slice(0, 5).map((order) => (
                                                <tr key={order.id} className="premium-table-row">
                                                    <td className="premium-table-cell font-mono font-bold text-xs tracking-wider text-neutral-300">LMD-{order.id.slice(0, 8).toUpperCase()}</td>
                                                    <td className="premium-table-cell font-mono">{order.deliveryPinCode}</td>
                                                    <td className="premium-table-cell">{order.weight} kg</td>
                                                    <td className="premium-table-cell">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="premium-table-action">
                                                        <Link href={`/orders/${order.id}`} className="premium-button-secondary h-8 text-[10px]">
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState 
                                    icon={Package} 
                                    title="No dispatch requests" 
                                    description="No delivery orders have been booked in the system yet." 
                                />
                            )}
                        </div>
                    </div>

                    {/* Right sidebar pane (30%) */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Coverage overview */}
                        <div className="premium-card space-y-4">
                            <h2 className="premium-tyo-caption">Coverage Zone Overview</h2>
                            <div className="space-y-3">
                                {zones.slice(0, 4).map((zone) => {
                                    let pins: string[] = []
                                    try {
                                        pins = JSON.parse(zone.pinCodes)
                                    } catch {}
                                    return (
                                        <div key={zone.id} className="flex justify-between items-center py-1.5 border-b border-neutral-850 last:border-b-0">
                                            <div>
                                                <p className="text-xs font-bold text-neutral-200">{zone.name}</p>
                                                <p className="text-[10px] text-neutral-500">{zone.city}</p>
                                            </div>
                                            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                                                {pins.length} PINs
                                            </span>
                                        </div>
                                    )
                                })}
                                {zones.length === 0 && <p className="text-xs text-neutral-500">No coverage zones configured.</p>}
                            </div>
                        </div>

                        {/* Agent availability list */}
                        <div className="premium-card space-y-4">
                            <h2 className="premium-tyo-caption">Active Personnel Status</h2>
                            <div className="space-y-3">
                                {agents.slice(0, 5).map((agent) => {
                                    const activeZone = zones.find((z) => z.id === agent.assignedZoneId)
                                    return (
                                        <div key={agent.id} className="flex items-center justify-between py-1.5 border-b border-neutral-850 last:border-b-0">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-neutral-200">{agent.name || 'Anonymous Agent'}</p>
                                                <p className="text-[10px] text-neutral-500">{activeZone ? activeZone.name : 'No Zone Assigned'}</p>
                                            </div>
                                            <StatusBadge status={agent.availability ? 'ONLINE' : 'OFFLINE'} />
                                        </div>
                                    )
                                })}
                                {agents.length === 0 && <p className="text-xs text-neutral-500">No registered driver agents found.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================================================
    // 2. DELIVERY DRIVER AGENT DASHBOARD
    // ==========================================================================
    if (role === 'DELIVERY_AGENT') {
        const activeDeliveries = orders.filter((o) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status))
        const completedDeliveries = orders.filter((o) => o.status === 'DELIVERED')
        const pendingPickups = orders.filter((o) => o.status === 'ASSIGNED')
        
        const todayStr = new Date().toDateString()
        const todayDeliveries = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr)

        const totalFinalized = completedDeliveries.length + orders.filter((o) => o.status === 'CANCELLED').length
        const successRate = totalFinalized > 0 ? Math.round((completedDeliveries.length / totalFinalized) * 100) : 100

        return (
            <div className="w-full max-w-6xl space-y-6 px-4 text-white">
                {/* Header */}
                <div className="space-y-1.5">
                    <h1 className="premium-tyo-display">Driver Dashboard</h1>
                    <p className="premium-tyo-secondary">
                        Welcome back! Manage and update status of packages assigned to your delivery zone.
                    </p>
                </div>

                {/* Metrics Summary Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="premium-card flex flex-col justify-between h-20 p-4">
                        <p className="premium-tyo-caption">Today&apos;s Tasks</p>
                        <div className="flex justify-between items-end">
                            <p className="text-xl font-bold text-white">{todayDeliveries.length}</p>
                            <Clock className="w-4 h-4 text-neutral-500" />
                        </div>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-20 p-4">
                        <p className="premium-tyo-caption">Active Transit</p>
                        <div className="flex justify-between items-end">
                            <p className="text-xl font-bold text-orange-400">{activeDeliveries.length}</p>
                            <Truck className="w-4 h-4 text-orange-500" />
                        </div>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-20 p-4">
                        <p className="premium-tyo-caption">Completed</p>
                        <div className="flex justify-between items-end">
                            <p className="text-xl font-bold text-green-500">{completedDeliveries.length}</p>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-20 p-4">
                        <p className="premium-tyo-caption">Pending Pickups</p>
                        <div className="flex justify-between items-end">
                            <p className="text-xl font-bold text-yellow-500">{pendingPickups.length}</p>
                            <Package className="w-4 h-4 text-yellow-500" />
                        </div>
                    </div>
                    <div className="premium-card flex flex-col justify-between h-20 p-4 col-span-2 md:col-span-1">
                        <p className="premium-tyo-caption">Success Ratio</p>
                        <div className="flex justify-between items-end">
                            <p className="text-xl font-bold text-indigo-400">{successRate}%</p>
                            <span className="text-[10px] text-neutral-500">Delivered</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="premium-card space-y-4">
                    <h2 className="premium-tyo-caption">Driver Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link href="/orders" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                            <Package className="w-5 h-5 mb-2 text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-200">View Deliveries</span>
                        </Link>
                        <button
                            onClick={() => {
                                setScanError(null)
                                setScanModalOpen(true)
                            }}
                            className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all cursor-pointer select-none"
                        >
                            <Search className="w-5 h-5 mb-2 text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-200">Scan Delivery ID</span>
                        </button>
                        <a href="#active-tasks-list" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                            <Zap className="w-5 h-5 mb-2 text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-200">Update Status</span>
                        </a>
                        <Link href="/profile" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                            <User className="w-5 h-5 mb-2 text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-200">My Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Active Deliveries List */}
                <div id="active-tasks-list" className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 scroll-mt-6">
                    <h2 className="premium-tyo-card">Your Active Task list ({activeDeliveries.length})</h2>
                    <div className="space-y-4">
                        {activeDeliveries.map((order) => (
                            <div key={order.id} className="p-4 bg-neutral-850/50 border border-neutral-800 rounded-lg space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-xs font-bold font-mono tracking-wider text-neutral-300">
                                                LMD-{order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-neutral-400"><strong className="text-neutral-300">Customer:</strong> {order.customerName || 'Anonymous'}</p>
                                        <p className="text-xs text-neutral-400"><strong className="text-neutral-300">Pickup:</strong> {order.pickupAddress}</p>
                                        <p className="text-xs text-neutral-400"><strong className="text-neutral-300">Delivery:</strong> {order.deliveryAddress} ({order.deliveryPinCode})</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-neutral-200">${order.price.toFixed(2)}</p>
                                        <p className="text-[10px] text-neutral-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2.5 border-t border-neutral-800/50">
                                    <Link href={`/orders/${order.id}`} className="premium-button-secondary text-[10px] h-8 px-3">
                                        View Details
                                    </Link>
                                    {order.status === 'ASSIGNED' && (
                                        <button
                                            onClick={async () => {
                                                await axios.patch(`/api/orders/${order.id}`, { status: 'PICKED_UP' })
                                                fetchData()
                                            }}
                                            className="premium-button-primary text-[10px] h-8 px-3 bg-indigo-600 text-white"
                                        >
                                            Mark Picked Up
                                        </button>
                                    )}
                                    {order.status === 'PICKED_UP' && (
                                        <button
                                            onClick={async () => {
                                                await axios.patch(`/api/orders/${order.id}`, { status: 'OUT_FOR_DELIVERY' })
                                                fetchData()
                                            }}
                                            className="premium-button-primary text-[10px] h-8 px-3 bg-orange-600 text-white"
                                        >
                                            Mark Out For Delivery
                                        </button>
                                    )}
                                    {order.status === 'OUT_FOR_DELIVERY' && (
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="premium-button-primary text-[10px] h-8 px-3 bg-green-600 text-white"
                                        >
                                            Verify OTP &amp; Deliver
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activeDeliveries.length === 0 && (
                            <EmptyState 
                                icon={Package} 
                                title="No active dispatches" 
                                description="Great job! You have no active assignments right now." 
                            />
                        )}
                    </div>
                </div>

                <PremiumDialog
                    open={scanModalOpen}
                    onClose={() => setScanModalOpen(false)}
                    title="Simulated Barcode Scanner"
                    description="Enter the Delivery Order ID (or LMD-XXXXX code) to simulate scanning a package label."
                    footer={
                        <>
                            <PremiumButton
                                variant="secondary"
                                className="h-8 text-[10px]"
                                onClick={() => setScanModalOpen(false)}
                            >
                                Cancel
                            </PremiumButton>
                            <PremiumButton
                                variant="primary"
                                className="h-8 text-[10px]"
                                type="submit"
                                form="scan-delivery-form"
                            >
                                Locate Shipment
                            </PremiumButton>
                        </>
                    }
                >
                    <form id="scan-delivery-form" onSubmit={handleScanSubmit} className="space-y-1">
                        <input
                            type="text"
                            value={scanValue}
                            onChange={(e) => setScanValue(e.target.value)}
                            placeholder="e.g. LMD-8c73b2a"
                            className="premium-input w-full"
                            autoFocus
                            aria-label="Delivery order ID"
                        />
                        {scanError && (
                            <p className="premium-form-error" role="alert">
                                {scanError}
                            </p>
                        )}
                    </form>
                </PremiumDialog>
            </div>
        )
    }

    // ==========================================================================
    // 3. CUSTOMER DASHBOARD
    // ==========================================================================
    const activeParcels = orders.filter((o) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status))
    const pendingParcels = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status))
    const deliveredParcels = orders.filter((o) => o.status === 'DELIVERED')

    const activities = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((order) => {
            const shortId = order.id.slice(0, 8)
            const time = new Date(order.createdAt).toLocaleDateString()
            let text = `Order LMD-${shortId.toUpperCase()} booked`
            if (order.status === 'DELIVERED') text = `Order LMD-${shortId.toUpperCase()} delivered`
            else if (order.status === 'OUT_FOR_DELIVERY') text = `Order LMD-${shortId.toUpperCase()} out for delivery`
            else if (order.status === 'PICKED_UP') text = `Order LMD-${shortId.toUpperCase()} picked up by agent`
            else if (order.status === 'ASSIGNED') text = `Order LMD-${shortId.toUpperCase()} assigned to agent`
            else if (order.status === 'CONFIRMED') text = `Order LMD-${shortId.toUpperCase()} confirmed by Admin`
            else if (order.status === 'CANCELLED') text = `Order LMD-${shortId.toUpperCase()} cancelled`
            return { text, time, status: order.status }
        })

    return (
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            {/* Top Welcome Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="premium-tyo-display">
                        Welcome back, {user?.name || 'Customer'}
                    </h1>
                    <p className="premium-tyo-secondary">
                        Manage your deliveries and monitor shipment activity.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/orders/create" className="premium-button-primary">
                        Book Delivery
                    </Link>
                    <Link href="/orders" className="premium-button-secondary">
                        View Orders
                    </Link>
                </div>
            </div>

            {/* KPI Metrics Grid Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="premium-card flex flex-col justify-between h-20 p-4">
                    <p className="premium-tyo-caption">Total Orders</p>
                    <div className="flex justify-between items-end">
                        <p className="text-xl font-bold text-white">{orders.length}</p>
                        <Package className="w-4 h-4 text-neutral-500" />
                    </div>
                </div>
                <div className="premium-card flex flex-col justify-between h-20 p-4">
                    <p className="premium-tyo-caption">Pending Bookings</p>
                    <div className="flex justify-between items-end">
                        <p className="text-xl font-bold text-yellow-500">{pendingParcels.length}</p>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                </div>
                <div className="premium-card flex flex-col justify-between h-20 p-4">
                    <p className="premium-tyo-caption">Delivered</p>
                    <div className="flex justify-between items-end">
                        <p className="text-xl font-bold text-green-500">{deliveredParcels.length}</p>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                </div>
                <div className="premium-card flex flex-col justify-between h-20 p-4">
                    <p className="premium-tyo-caption">In Transit</p>
                    <div className="flex justify-between items-end">
                        <p className="text-xl font-bold text-indigo-400">{activeParcels.length}</p>
                        <Truck className="w-4 h-4 text-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Layout columns (70 / 30 split) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Columns (Quick Actions & Recent Orders Table) (70%) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions Panel */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-card">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/orders/create" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                <Package className="w-5 h-5 mb-2 text-neutral-400" />
                                <span className="text-xs font-bold text-neutral-200">Book Delivery</span>
                            </Link>
                            <Link href="/orders" className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                <FileText className="w-5 h-5 mb-2 text-neutral-400" />
                                <span className="text-xs font-bold text-neutral-200">View Orders</span>
                            </Link>
                            {orders.length > 0 ? (
                                <Link href={`/orders/${orders[0].id}`} className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all select-none">
                                    <Search className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Track Shipment</span>
                                </Link>
                            ) : (
                                <button onClick={() => alert('No active shipments to track yet.')} className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all cursor-pointer">
                                    <Search className="w-5 h-5 mb-2 text-neutral-400" />
                                    <span className="text-xs font-bold text-neutral-200">Track Shipment</span>
                                </button>
                            )}
                            <button
                                onClick={() => alert('Invoice download triggered for recent deliveries.')}
                                className="flex flex-col items-center justify-center p-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-center transition-all cursor-pointer select-none"
                            >
                                <DollarSign className="w-5 h-5 mb-2 text-neutral-400" />
                                <span className="text-xs font-bold text-neutral-200">Get Invoice</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-neutral-855 flex justify-between items-center bg-neutral-900/50">
                            <h2 className="premium-tyo-card">Recent Orders</h2>
                            {orders.length > 0 && (
                                <Link href="/orders" className="text-xs text-indigo-400 hover:underline font-semibold">
                                    View all dispatches
                                </Link>
                            )}
                        </div>

                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="premium-table">
                                    <thead>
                                        <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
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
                                            <tr key={order.id} className="premium-table-row">
                                                <td className="premium-table-cell font-mono font-bold text-xs tracking-wider text-neutral-300">LMD-{order.id.slice(0, 8).toUpperCase()}</td>
                                                <td className="premium-table-cell max-w-[150px] truncate">
                                                    {order.deliveryAddress} ({order.deliveryPinCode})
                                                </td>
                                                <td className="premium-table-cell text-neutral-400">
                                                    {order.agentName || 'Unassigned'}
                                                </td>
                                                <td className="premium-table-cell">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="premium-table-cell text-neutral-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="premium-table-action">
                                                    <Link href={`/orders/${order.id}`} className="premium-button-secondary h-8 text-[10px]">
                                                        Track
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState 
                                icon={Package} 
                                title="No shipments" 
                                description="You have not booked any shipment orders yet." 
                                action={<Link href="/orders/create" className="premium-button-primary text-xs h-8">Book Delivery</Link>}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column (Recent Activity Panel Timeline) (30%) */}
                <div className="lg:col-span-1 premium-card h-fit space-y-6">
                    <h2 className="premium-tyo-card">Recent Activity</h2>
                    
                    {activities.length > 0 ? (
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                            {activities.map((act, idx) => (
                                <div key={`act-${idx}`} className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-xs z-10 shrink-0 mt-0.5 text-neutral-400 font-bold">
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
