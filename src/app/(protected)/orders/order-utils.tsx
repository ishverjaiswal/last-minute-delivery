/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

export function matchesSearch(order: any, query: string): boolean {
    if (!query) return true

    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)

    if (tokens.length === 0) return true

    const searchableFields = [
        order.id,
        order.status,
        order.pickupAddress,
        order.deliveryAddress,
        order.deliveryPinCode,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.agentName,
        order.agentEmail,
        order.agentPhone,
        order.zoneName,
        new Date(order.createdAt).toLocaleDateString(),
        new Date(order.createdAt).toLocaleString(),
    ]
        .map((field) => (field ? String(field).toLowerCase() : ''))
        .filter(Boolean)

    return tokens.every((token) =>
        searchableFields.some((field) => field.includes(token))
    )
}

export function sortOrders(orders: any[], sortOrder: string): any[] {
    const sorted = [...orders]
    switch (sortOrder) {
        case 'NEWEST':
            return sorted.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
        case 'OLDEST':
            return sorted.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
        case 'CUSTOMER_NAME':
            return sorted.sort((a, b) => {
                const nameA =
                    a.customerName || `User #${a.customerId.slice(0, 8)}`
                const nameB =
                    b.customerName || `User #${b.customerId.slice(0, 8)}`
                return nameA.localeCompare(nameB)
            })
        case 'AGENT_NAME':
            return sorted.sort((a, b) => {
                const nameA =
                    a.agentName ||
                    (a.agentId
                        ? `Agent #${a.agentId.slice(0, 8)}`
                        : 'Unassigned')
                const nameB =
                    b.agentName ||
                    (b.agentId
                        ? `Agent #${b.agentId.slice(0, 8)}`
                        : 'Unassigned')
                return nameA.localeCompare(nameB)
            })
        case 'ZONE':
            return sorted.sort((a, b) => {
                const zoneA = a.zoneName || ''
                const zoneB = b.zoneName || ''
                return zoneA.localeCompare(zoneB)
            })
        case 'STATUS':
            return sorted.sort((a, b) => a.status.localeCompare(b.status))
        case 'ORDER_ID':
            return sorted.sort((a, b) => a.id.localeCompare(b.id))
        default:
            return sorted
    }
}

export function highlightText(
    text: string | null | undefined,
    query: string
): React.ReactNode {
    if (!text) return ''
    if (!query) return text

    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)

    if (tokens.length === 0) return text

    const escapedTokens = tokens.map((t) =>
        t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    )
    const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi')
    const parts = text.split(regex)

    return (
        <>
            {parts.map((part, i) => {
                const isMatch = tokens.some((t) => part.toLowerCase() === t)
                return isMatch ? (
                    <mark
                        key={i}
                        className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded font-bold"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            })}
        </>
    )
}
