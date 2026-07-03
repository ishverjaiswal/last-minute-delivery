/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { orderService } from '@/services/order.service'
import { createOrderSchema } from '@/lib/schema/delivery.schema'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Auth required' },
            },
            { status: 401 }
        )
    }

    try {
        const orders = await orderService.getOrdersByRole(
            session.user.id,
            session.user.role || 'CUSTOMER'
        )
        return NextResponse.json({ success: true, data: orders })
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
            },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Auth required' },
            },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const parsed = createOrderSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid fields',
                        details: parsed.error.flatten(),
                    },
                },
                { status: 400 }
            )
        }

        const newOrder = await orderService.createNewOrder(
            session.user.id,
            parsed.data
        )
        return NextResponse.json({ success: true, data: newOrder })
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'BUSINESS_RULE_VIOLATION',
                    message: err.message,
                },
            },
            { status: 422 }
        )
    }
}
