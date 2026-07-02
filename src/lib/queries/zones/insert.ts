import { db } from '@/lib/dbconfig/db'
import { zonesTable, InsertZone } from '@/lib/dbconfig/schema'

export const createZone = async (data: InsertZone) => {
    const [newZone] = await db.insert(zonesTable).values(data).returning()
    return newZone
}
