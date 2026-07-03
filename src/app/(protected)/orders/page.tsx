/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'
import axios from 'axios'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { matchesSearch, sortOrders, highlightText } from './order-utils'
import { Package } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { PageHeader } from '@/components/ui/PageHeader'

export default function OrdersPage() {
    const user = useCurrentUser()
    const role = user?.role

    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Selection & Bulk State
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

    // Filters and Search States
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [sortOrder, setSortOrder] = useState('NEWEST')

    const searchInputRef = useRef<HTMLInputElement>(null)

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders')
            if (res.data.success) {
                setOrders(res.data.data)
            }
        } catch (err) {
            console.error('Failed to load orders:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // Keyboard shortcuts (Ctrl+K to focus search, Esc to clear)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
            if (e.key === 'Escape') {
                setSearchQuery('')
                setFilterStatus('ALL')
                setSelectedOrderIds([])
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filteredAndSortedOrders = useMemo(() => {
        let results = [...orders]

        if (role === 'CUSTOMER') {
            results = results.filter((o) => o.customerId === user?.id)
        } else if (role === 'DELIVERY_AGENT') {
            results = results.filter((o) => o.agentId === user?.id)
        }

        if (filterStatus !== 'ALL') {
            results = results.filter((o) => o.status === filterStatus)
        }

        if (searchQuery.trim()) {
            results = results.filter((o) =>
                matchesSearch(o, searchQuery.trim())
            )
        }

        return sortOrders(results, sortOrder)
    }, [orders, role, user, filterStatus, searchQuery, sortOrder])

    // Bulk selection handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const currentIds = filteredAndSortedOrders.map((o) => o.id)
            setSelectedOrderIds(currentIds)
        } else {
            setSelectedOrderIds([])
        }
    }

    const handleSelectRow = (id: string) => {
        if (selectedOrderIds.includes(id)) {
            setSelectedOrderIds((prev) => prev.filter((item) => item !== id))
        } else {
            setSelectedOrderIds((prev) => [...prev, id])
        }
    }

    const isAllSelected = useMemo(() => {
        if (filteredAndSortedOrders.length === 0) return false
        return filteredAndSortedOrders.every((o) =>
            selectedOrderIds.includes(o.id)
        )
    }, [filteredAndSortedOrders, selectedOrderIds])

    const handleClearAll = () => {
        setSearchQuery('')
        setFilterStatus('ALL')
        setSortOrder('NEWEST')
        setSelectedOrderIds([])
    }

    if (loading) {
        return (
            <div className="w-full max-w-6xl space-y-4 px-4 text-white">
                <PageHeader
                    title={
                        role === 'ADMIN' ? 'Operations Console' : 'My Orders'
                    }
                    description="Loading shipment records…"
                />
                <SkeletonTable rows={5} cols={7} />
            </div>
        )
    }

    const statuses = [
        'ALL',
        'PENDING',
        'CONFIRMED',
        'ASSIGNED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
    ]

    return (
        <div className="w-full max-w-6xl space-y-4 px-4 text-white">
            {/* Header section */}
            <PageHeader
                title={role === 'ADMIN' ? 'Operations Console' : 'My Orders'}
                description={
                    role === 'ADMIN'
                        ? 'Overview of all Kanpur courier assignments, package dispatches, and processing states.'
                        : 'Monitor shipment status, tracking history, and invoice pricing details.'
                }
                action={
                    role === 'CUSTOMER' ? (
                        <Link
                            href="/orders/create"
                            className="premium-button-primary"
                        >
                            Book New Delivery
                        </Link>
                    ) : undefined
                }
            />

            {/* Shipment Records */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden">
                {/* Secondary Search & Filter Row */}
                <TableToolbar
                    resultCount={{
                        shown: filteredAndSortedOrders.length,
                        total: orders.length,
                    }}
                >
                    <SearchInput
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        placeholder="Search Order ID, customer, zone, status or date…"
                        aria-label="Search orders"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <FilterSelect
                            id="orders-sort"
                            label="Sort"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            aria-label="Sort orders"
                        >
                            <option value="NEWEST">Newest</option>
                            <option value="OLDEST">Oldest</option>
                            <option value="CUSTOMER_NAME">Customer</option>
                            <option value="ZONE">Zone</option>
                            <option value="STATUS">Status</option>
                        </FilterSelect>

                        <FilterSelect
                            id="orders-status"
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            aria-label="Filter by status"
                        >
                            {statuses.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </FilterSelect>

                        {(searchQuery ||
                            filterStatus !== 'ALL' ||
                            sortOrder !== 'NEWEST') && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="premium-button-secondary h-8 px-3 text-[10px]"
                            >
                                Reset filters
                            </button>
                        )}
                    </div>
                </TableToolbar>

                {/* Selected Bulk Counts bar if selected */}
                {selectedOrderIds.length > 0 && (
                    <div className="p-3 bg-indigo-500/10 border-b border-indigo-500/20 text-indigo-400 text-xs font-bold flex justify-between items-center px-5">
                        <span>
                            Selected {selectedOrderIds.length} orders for bulk
                            review
                        </span>
                        <button
                            onClick={() => setSelectedOrderIds([])}
                            className="text-neutral-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer"
                        >
                            Deselect all
                        </button>
                    </div>
                )}

                {filteredAndSortedOrders.length > 0 ? (
                    <>
                        {/* Table View (Desktop & Tablet) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr className="border-b border-neutral-850 bg-neutral-950 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 accent-indigo-650 rounded bg-neutral-900 border-neutral-800 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer</th>
                                        {role === 'ADMIN' && (
                                            <th className="p-4">
                                                Assigned Agent
                                            </th>
                                        )}
                                        {role === 'DELIVERY_AGENT' && (
                                            <th className="p-4">
                                                Pickup Address
                                            </th>
                                        )}
                                        <th className="p-4">Zone / PIN</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Created</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-850">
                                    {filteredAndSortedOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="premium-table-row"
                                        >
                                            <td className="premium-table-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.includes(
                                                        order.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectRow(
                                                            order.id
                                                        )
                                                    }
                                                    className="w-4 h-4 accent-indigo-650 rounded bg-neutral-900 border-neutral-800 cursor-pointer"
                                                />
                                            </td>
                                            <td className="premium-table-cell font-bold font-mono tracking-wider text-xs text-neutral-300">
                                                LMD-
                                                {highlightText(
                                                    order.id
                                                        .slice(0, 8)
                                                        .toUpperCase(),
                                                    searchQuery
                                                )}
                                            </td>
                                            <td className="premium-table-cell">
                                                {order.customerName ? (
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-neutral-200">
                                                            {highlightText(
                                                                order.customerName,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-500 font-mono">
                                                            {highlightText(
                                                                order.customerEmail,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    `User #${order.customerId.slice(0, 8)}`
                                                )}
                                            </td>
                                            {role === 'ADMIN' && (
                                                <td className="premium-table-cell">
                                                    {order.agentName ? (
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-neutral-200">
                                                                {highlightText(
                                                                    order.agentName,
                                                                    searchQuery
                                                                )}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-500 font-mono">
                                                                {highlightText(
                                                                    order.agentPhone,
                                                                    searchQuery
                                                                )}
                                                            </p>
                                                        </div>
                                                    ) : order.agentId ? (
                                                        `Agent #${order.agentId.slice(0, 8)}`
                                                    ) : (
                                                        <span className="text-neutral-600 italic">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            {role === 'DELIVERY_AGENT' && (
                                                <td
                                                    className="premium-table-cell text-neutral-400 max-w-[180px] truncate"
                                                    title={order.pickupAddress}
                                                >
                                                    {highlightText(
                                                        order.pickupAddress,
                                                        searchQuery
                                                    )}
                                                </td>
                                            )}
                                            <td className="premium-table-cell">
                                                {order.zoneName ? (
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-neutral-200">
                                                            {highlightText(
                                                                order.zoneName,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] text-neutral-500 font-mono">
                                                            PIN:{' '}
                                                            {highlightText(
                                                                order.deliveryPinCode,
                                                                searchQuery
                                                            )}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono">
                                                        {highlightText(
                                                            order.deliveryPinCode,
                                                            searchQuery
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="premium-table-cell">
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </td>
                                            <td className="premium-table-cell text-neutral-400">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="premium-table-action">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="premium-button-secondary h-8 text-[10px] px-3"
                                                >
                                                    {role === 'ADMIN'
                                                        ? 'Manage'
                                                        : 'Track'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards Layout (Mobile View) */}
                        <div className="block md:hidden divide-y divide-neutral-850">
                            {filteredAndSortedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-4 space-y-3 bg-neutral-900/10"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrderIds.includes(
                                                    order.id
                                                )}
                                                onChange={() =>
                                                    handleSelectRow(order.id)
                                                }
                                                className="w-4 h-4 accent-indigo-650 rounded bg-neutral-900 border-neutral-800 cursor-pointer"
                                            />
                                            <span className="font-bold text-xs tracking-wide font-mono text-white">
                                                LMD-
                                                {order.id
                                                    .slice(0, 8)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="space-y-1.5 text-xs text-neutral-400">
                                        <div className="flex justify-between">
                                            <span>Customer</span>
                                            <span className="text-neutral-200">
                                                {order.customerName
                                                    ? highlightText(
                                                          order.customerName,
                                                          searchQuery
                                                      )
                                                    : `User #${order.customerId.slice(0, 8)}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Agent</span>
                                            <span className="text-neutral-200">
                                                {order.agentName
                                                    ? highlightText(
                                                          order.agentName,
                                                          searchQuery
                                                      )
                                                    : order.agentId
                                                      ? `Agent #${order.agentId.slice(0, 8)}`
                                                      : 'Unassigned'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Zone</span>
                                            <span className="text-neutral-200 text-right">
                                                {order.zoneName
                                                    ? highlightText(
                                                          order.zoneName,
                                                          searchQuery
                                                      )
                                                    : 'N/A'}{' '}
                                                (PIN:{' '}
                                                {highlightText(
                                                    order.deliveryPinCode,
                                                    searchQuery
                                                )}
                                                )
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Created</span>
                                            <span className="text-neutral-200">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-neutral-855 flex justify-end">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="premium-button-secondary h-8 text-[10px] px-3"
                                        >
                                            {role === 'ADMIN'
                                                ? 'Manage'
                                                : 'Track'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Search Empty State primitive */
                    <EmptyState
                        icon={Package}
                        title="No deliveries found"
                        description="Try searching by Order ID, recipient address, customer credentials, or assigned driver names."
                        action={
                            <button
                                onClick={handleClearAll}
                                className="premium-button-primary h-8 text-[10px]"
                            >
                                Reset Search &amp; Filters
                            </button>
                        }
                    />
                )}
            </div>
        </div>
    )
}
