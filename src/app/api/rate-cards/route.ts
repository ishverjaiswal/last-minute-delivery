/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { createRateCard } from '@/lib/queries/rate-cards/insert'
import { findAllRateCards } from '@/lib/queries/rate-cards/select'
import { createRateCardSchema } from '@/lib/schema/delivery.schema'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHENTICATED', message: 'Auth required' } },
            { status: 401 }
        )
    }
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin only' } },
            { status: 403 }
        )
    }

    try {
        const rateCards = await findAllRateCards()
        return NextResponse.json({ success: true, data: rateCards })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHENTICATED', message: 'Auth required' } },
            { status: 401 }
        )
    }
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin only' } },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const parsed = createRateCardSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid fields', details: parsed.error.flatten() } },
                { status: 400 }
            )
        }

        const newRateCard = await createRateCard(parsed.data)
        return NextResponse.json({ success: true, data: newRateCard })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}
