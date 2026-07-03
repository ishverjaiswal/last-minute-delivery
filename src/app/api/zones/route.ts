/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { createZone } from '@/lib/queries/zones/insert'
import { findAllZones } from '@/lib/queries/zones/select'
import { createZoneSchema } from '@/lib/schema/delivery.schema'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Auth required' },
            },
            { status: 401 }
        )
    }

    try {
        const zones = await findAllZones()
        return NextResponse.json({ success: true, data: zones })
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
    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Auth required' },
            },
            { status: 401 }
        )
    }
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Admin only' },
            },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const parsed = createZoneSchema.safeParse(body)
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

        const newZone = await createZone({
            name: parsed.data.name,
            city: parsed.data.city,
            state: parsed.data.state,
            pinCodes: JSON.stringify(parsed.data.pinCodes),
        })

        return NextResponse.json({ success: true, data: newZone })
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
