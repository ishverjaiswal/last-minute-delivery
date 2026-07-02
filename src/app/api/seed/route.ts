/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/dbconfig/db'
import { zonesTable, rateCardsTable } from '@/lib/dbconfig/schema'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
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
            basePrice: 15.00,
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
            basePrice: 12.00,
        })

        return NextResponse.json({
            success: true,
            message: 'Database seeded with default zones and rate cards successfully (including PIN code 209305).',
        })
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } },
            { status: 500 }
        )
    }
}
