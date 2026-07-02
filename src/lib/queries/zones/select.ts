import { db } from '@/lib/dbconfig/db'
import { zonesTable } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const findAllZones = async () => {
    return db.select().from(zonesTable)
}

export const findZoneById = async (id: string) => {
    const [zone] = await db.select().from(zonesTable).where(eq(zonesTable.id, id))
    return zone || null
}
