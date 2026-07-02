/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { agentService } from '@/services/agent.service'
import { createAgentSchema } from '@/lib/schema/delivery.schema'
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
        const agents = await agentService.getAgentsList()
        return NextResponse.json({ success: true, data: agents })
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
        const parsed = createAgentSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid fields', details: parsed.error.flatten() } },
                { status: 400 }
            )
        }

        const newAgent = await agentService.registerAgent(
            parsed.data.userId,
            parsed.data.phone,
            parsed.data.assignedZoneId
        )

        return NextResponse.json({ success: true, data: newAgent })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}
