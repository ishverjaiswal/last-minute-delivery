/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { statusHistoryService } from '@/services/status-history.service'
import { orderService } from '@/services/order.service'
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
            const { findAgentByUserId } = await import('@/lib/queries/agents/select')
            const agent = await findAgentByUserId(session.user.id)
            if (!agent || order.agentId !== agent.id) {
                return NextResponse.json(
                    { success: false, error: { code: 'UNAUTHORIZED', message: 'Access denied' } },
                    { status: 403 }
                )
            }
        }

        const history = await statusHistoryService.getOrderHistory(id)
        return NextResponse.json({ success: true, data: history })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}
