/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { agentService } from '@/services/agent.service'
import { findAgentByUserId } from '@/lib/queries/agents/select'
import { zonesTable } from '@/lib/dbconfig/schema'
import { db } from '@/lib/dbconfig/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const agent = await findAgentByUserId(session.user.id)
        if (!agent) {
            return NextResponse.json(
                { success: false, error: 'Agent profile not found' },
                { status: 404 }
            )
        }

        // Get zone name if assigned
        let zoneName = 'No Zone Assigned'
        if (agent.assignedZoneId) {
            const [zone] = await db
                .select()
                .from(zonesTable)
                .where(eq(zonesTable.id, agent.assignedZoneId))
            if (zone) zoneName = zone.name
        }

        return NextResponse.json({
            success: true,
            data: {
                ...agent,
                name: session.user.name,
                email: session.user.email,
                zoneName,
            },
        })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const agent = await findAgentByUserId(session.user.id)
        if (!agent) {
            return NextResponse.json(
                { success: false, error: 'Agent profile not found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { availability } = body

        if (typeof availability === 'boolean') {
            await agentService.toggleAgentAvailability(agent.id, availability)
        }

        return NextResponse.json({
            success: true,
            message: 'Availability status updated successfully.',
        })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        )
    }
}
