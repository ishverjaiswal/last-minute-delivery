/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { orderService } from '@/services/order.service'
import { updateOrderSchema } from '@/lib/schema/delivery.schema'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHENTICATED', message: 'Auth required' } },
            { status: 401 }
        )
    }

    try {
        const { id } = await params
        const order = await orderService.getOrderDetail(id)
        if (!order) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
                { status: 404 }
            )
        }

        // Access check
        if (session.user.role !== 'ADMIN' && order.customerId !== session.user.id) {
            // Check if it's assigned to this courier agent
            const { findAgentByUserId } = await import('@/lib/queries/agents/select')
            const agent = await findAgentByUserId(session.user.id)
            if (!agent || order.agentId !== agent.id) {
                return NextResponse.json(
                    { success: false, error: { code: 'UNAUTHORIZED', message: 'Access denied' } },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json({ success: true, data: order })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHENTICATED', message: 'Auth required' } },
            { status: 401 }
        )
    }

    try {
        const { id } = await params
        const body = await request.json()
        const parsed = updateOrderSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid fields', details: parsed.error.flatten() } },
                { status: 400 }
            )
        }

        const { agentId, status } = parsed.data
        let updatedOrder = null

        // If admin wants to assign courier agent
        if (agentId !== undefined) {
            if (session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin only for driver assignment' } },
                    { status: 403 }
                )
            }
            if (agentId === null) {
                // unassigning driver
                const { updateOrder } = await import('@/lib/queries/orders/update')
                updatedOrder = await updateOrder(id, { agentId: null })
            } else {
                updatedOrder = await orderService.assignCourier(id, agentId, session.user.id)
            }
        }

        // If updating status
        if (status !== undefined) {
            // Access control for status changes
            const order = await orderService.getOrderDetail(id)
            if (!order) {
                return NextResponse.json(
                    { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
                    { status: 404 }
                )
            }

            if (session.user.role === 'ADMIN') {
                updatedOrder = await orderService.updateStatus(id, status, session.user.id)
            } else if (session.user.role === 'DELIVERY_AGENT') {
                // Check if this order is assigned to the driver
                const { findAgentByUserId } = await import('@/lib/queries/agents/select')
                const agent = await findAgentByUserId(session.user.id)
                if (!agent || order.agentId !== agent.id) {
                    return NextResponse.json(
                        { success: false, error: { code: 'UNAUTHORIZED', message: 'Access denied: not your assigned order' } },
                        { status: 403 }
                    )
                }

                updatedOrder = await orderService.updateStatus(id, status, session.user.id)
            } else {
                // Customer cannot change status except maybe cancel
                if (status === 'CANCELLED' && order.customerId === session.user.id) {
                    if (order.status !== 'PENDING') {
                        return NextResponse.json(
                            { success: false, error: { code: 'BUSINESS_RULE_VIOLATION', message: 'Cannot cancel order once processed' } },
                            { status: 422 }
                        )
                    }
                    updatedOrder = await orderService.updateStatus(id, 'CANCELLED', session.user.id)
                } else {
                    return NextResponse.json(
                        { success: false, error: { code: 'UNAUTHORIZED', message: 'Access denied' } },
                        { status: 403 }
                    )
                }
            }
        }

        return NextResponse.json({ success: true, data: updatedOrder })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'BUSINESS_RULE_VIOLATION', message: err.message } },
            { status: 422 }
        )
    }
}
