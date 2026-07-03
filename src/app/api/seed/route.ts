/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/dbconfig/db'
import {
    zonesTable,
    rateCardsTable,
    usersTable,
    deliveryAgentProfilesTable,
    ordersTable,
    orderStatusHistoryTable,
    UserRole,
} from '@/lib/dbconfig/schema'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        // 0. Clean the DB tables in correct topological order to prevent FK violations
        await db.delete(orderStatusHistoryTable)
        await db.delete(ordersTable)
        await db.delete(deliveryAgentProfilesTable)
        await db.delete(rateCardsTable)
        await db.delete(zonesTable)
        await db.delete(usersTable)

        // 1. Create default Kanpur Zone containing 209305
        const [kanpurZone] = await db
            .insert(zonesTable)
            .values({
                name: 'Kanpur Zone',
                city: 'Kanpur',
                state: 'Uttar Pradesh',
                pinCodes: JSON.stringify(['209305', '208001', '208002']),
            })
            .returning()

        // 2. Create Rate Card for Kanpur Zone
        await db.insert(rateCardsTable).values({
            zoneId: kanpurZone.id,
            minWeight: 0,
            maxWeight: 100,
            basePrice: 15.0,
        })

        // 3. Create default Delhi Zone
        const [delhiZone] = await db
            .insert(zonesTable)
            .values({
                name: 'Delhi Zone',
                city: 'Delhi',
                state: 'Delhi',
                pinCodes: JSON.stringify(['110001', '110002', '110003']),
            })
            .returning()

        // 4. Create Rate Card for Delhi Zone
        await db.insert(rateCardsTable).values({
            zoneId: delhiZone.id,
            minWeight: 0,
            maxWeight: 100,
            basePrice: 12.0,
        })

        // 5. Hash password
        const hashedPassword = await bcrypt.hash('password123', 10)

        // 6. Create Seed Users
        // Admin
        await db.insert(usersTable).values({
            id: 'a05705e8-5d2d-411a-8b8a-115f2066fa62',
            name: 'Demo Admin',
            email: 'admin@lastmile.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
            emailVerified: new Date(),
        })

        // Customer
        await db.insert(usersTable).values({
            id: 'c05705e8-5d2d-411a-8b8a-115f2066fa61',
            name: 'Demo Customer',
            email: 'customer@lastmile.com',
            password: hashedPassword,
            role: UserRole.CUSTOMER,
            emailVerified: new Date(),
        })

        // Delivery Agent (pre-registered profile)
        const [agentUser] = await db
            .insert(usersTable)
            .values({
                id: 'd05705e8-5d2d-411a-8b8a-115f2066fa63',
                name: 'Demo Agent',
                email: 'agent@lastmile.com',
                password: hashedPassword,
                role: UserRole.DELIVERY_AGENT,
                emailVerified: new Date(),
            })
            .returning()

        await db.insert(deliveryAgentProfilesTable).values({
            userId: agentUser.id,
            phone: '+91 9999988888',
            assignedZoneId: kanpurZone.id,
            availability: true,
        })

        // Unregistered Agent User (available for autofill/registration)
        await db.insert(usersTable).values({
            id: 'e05705e8-5d2d-411a-8b8a-115f2066fa64',
            name: 'Demo Agent Unregistered',
            email: 'agent-unregistered@lastmile.com',
            password: hashedPassword,
            role: UserRole.DELIVERY_AGENT,
            emailVerified: new Date(),
        })

        return NextResponse.json({
            success: true,
            message:
                'Database seeded with default zones, rate cards, and demo users successfully.',
        })
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
