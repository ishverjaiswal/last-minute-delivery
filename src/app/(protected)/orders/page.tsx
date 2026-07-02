/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'

export default function OrdersPage() {
    const user = useCurrentUser()
    const role = user?.role

    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders')
                if (res.data.success) {
                    setOrders(res.data.data)
                }
            } catch (err) {
                console.error('Error fetching orders:', err)
            } finally {
                setLoading(false)
            }
        }
        if (role) {
            fetchOrders()
        }
    }, [role])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
                <p className="text-neutral-400">Loading orders...</p>
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

    // Client-side search and status filter combined
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus
        const matchesQuery =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryPinCode.includes(searchQuery) ||
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesQuery
    })

    const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {role === 'ADMIN' ? 'All Deliveries' : 'My Orders'}
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        {role === 'ADMIN'
                            ? 'Overview of all courier assignments, package dispatches, and processing states.'
                            : 'Monitor shipment status, tracking history, and invoice pricing details.'}
                    </p>
                </div>
                {role === 'CUSTOMER' && (
                    <Link href="/orders/create" className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow cursor-pointer">
                        Book New Delivery
                    </Link>
                )}
            </div>

            {/* Filter and Search Bar controls */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Order ID, PIN code or destination address..."
                            className="w-full h-10 px-4 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-700"
                        />
                    </div>
                    {/* Status Tabs dropdown/filters */}
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                                    filterStatus === status
                                        ? 'bg-white border-white text-black'
                                        : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Management Table */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-855">
                    <h2 className="text-lg font-bold tracking-tight">Shipment Records ({filteredOrders.length})</h2>
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Assigned Agent</th>
                                    <th className="p-4">Zone PIN</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Created</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-850">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-850/20 transition-colors">
                                        <td className="p-4 font-bold text-xs tracking-wide">{order.id.slice(0, 8)}...</td>
                                        <td className="p-4 text-xs text-neutral-400">
                                            User #{order.customerId.slice(0, 8)}
                                        </td>
                                        <td className="p-4 text-xs text-neutral-400">
                                            {order.agentId ? `Agent #${order.agentId.slice(0, 8)}` : 'Unassigned'}
                                        </td>
                                        <td className="p-4 font-mono text-xs">{order.deliveryPinCode}</td>
                                        <td className="p-4">
                                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                        </td>
                                        <td className="p-4 text-xs text-neutral-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/orders/${order.id}`} className="bg-neutral-800 hover:bg-neutral-750 text-xs px-3 py-1.5 border border-neutral-700 rounded font-bold transition-all">
                                                {role === 'ADMIN' ? 'Manage' : 'Track'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-500">No shipments match the selected filters.</div>
                )}
            </div>
        </div>
    )
}
