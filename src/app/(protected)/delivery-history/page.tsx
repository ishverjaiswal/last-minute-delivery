/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { History } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonMetrics, SkeletonTable } from '@/components/ui/Skeleton'
import { PageHeaderSkeleton, PageSkeleton } from '@/components/ui/PageSkeleton'
import {
    PremiumTable,
    TableHeader,
    TableHeaderRow,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableActionCell,
    TableContainer,
} from '@/components/ui/PremiumTable'

export default function DeliveryHistoryPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders')
            if (res.data.success) {
                setOrders(res.data.data)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const historyDeliveries = useMemo(() => {
        return orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status))
    }, [orders])

    const completedDeliveries = useMemo(() => {
        return historyDeliveries.filter((o) => o.status === 'DELIVERED')
    }, [historyDeliveries])

    const completedCount = completedDeliveries.length
    const totalDistance = completedCount * 4.2
    const totalEarnings = completedDeliveries.reduce((sum, o) => sum + (o.price * 0.15 + 3.5), 0)
    const successRate =
        historyDeliveries.length > 0
            ? Math.round((completedCount / historyDeliveries.length) * 100)
            : 100
    const averageTime = completedCount > 0 ? '24.5 mins' : 'N/A'

    if (loading) {
        return (
            <PageSkeleton>
                <PageHeaderSkeleton />
                <SkeletonMetrics count={5} />
                <SkeletonTable rows={5} cols={8} />
            </PageSkeleton>
        )
    }

    if (error) {
        return (
            <PageSkeleton className="max-w-md mx-auto">
                <EmptyState
                    title="Failed to load delivery history"
                    description={error}
                    action={
                        <button type="button" onClick={fetchOrders} className="premium-button-primary h-8 text-xs">
                            Retry
                        </button>
                    }
                />
            </PageSkeleton>
        )
    }

    return (
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            <PageHeader
                title="Delivery History"
                description="Review completed shipments, mileage logs, and payout commission metrics."
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="premium-card flex h-20 flex-col justify-between p-4">
                    <p className="premium-typo-caption">Completed</p>
                    <p className="text-xl font-bold">{completedCount}</p>
                </div>
                <div className="premium-card flex h-20 flex-col justify-between p-4">
                    <p className="premium-typo-caption">Earnings</p>
                    <p className="text-xl font-bold text-green-500">${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="premium-card flex h-20 flex-col justify-between p-4">
                    <p className="premium-typo-caption">Total Distance</p>
                    <p className="text-xl font-bold">{totalDistance.toFixed(1)} km</p>
                </div>
                <div className="premium-card flex h-20 flex-col justify-between p-4">
                    <p className="premium-typo-caption">Avg Transit Time</p>
                    <p className="text-xl font-bold">{averageTime}</p>
                </div>
                <div className="premium-card col-span-2 flex h-20 flex-col justify-between p-4 md:col-span-1">
                    <p className="premium-typo-caption">Success Rate</p>
                    <p className="text-xl font-bold text-indigo-400">{successRate}%</p>
                </div>
            </div>

            <TableContainer title="Finalized Shipment Log" count={historyDeliveries.length}>
                {historyDeliveries.length > 0 ? (
                    <PremiumTable>
                        <TableHeader>
                            <TableHeaderRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Destination Address</TableHead>
                                <TableHead>PIN</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Completed Date</TableHead>
                                <TableHead className="text-right">Earning</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableHeaderRow>
                        </TableHeader>
                        <TableBody>
                            {historyDeliveries.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs font-bold tracking-wide">
                                        LMD-{order.id.slice(0, 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-neutral-200">
                                            {order.customerName || 'Anonymous'}
                                        </p>
                                        <p className="font-mono text-[10px] text-neutral-500">{order.customerEmail}</p>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-neutral-400">
                                        <span title={order.deliveryAddress}>{order.deliveryAddress}</span>
                                    </TableCell>
                                    <TableCell className="font-mono text-neutral-300">{order.deliveryPinCode}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="text-neutral-400">
                                        {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-neutral-200">
                                        {order.status === 'DELIVERED'
                                            ? `$${(order.price * 0.15 + 3.5).toFixed(2)}`
                                            : '$0.00'}
                                    </TableCell>
                                    <TableActionCell>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="premium-button-secondary h-8 px-3 text-[10px]"
                                        >
                                            View details
                                        </Link>
                                    </TableActionCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </PremiumTable>
                ) : (
                    <EmptyState
                        icon={History}
                        title="No delivery history yet"
                        description="Complete assigned deliveries to see finalized shipment records here."
                        action={
                            <Link href="/orders" className="premium-button-primary h-8 text-xs">
                                View Active Deliveries
                            </Link>
                        }
                    />
                )}
            </TableContainer>
        </div>
    )
}
