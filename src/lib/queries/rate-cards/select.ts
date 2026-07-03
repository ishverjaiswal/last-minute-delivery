import { db } from '@/lib/dbconfig/db'
import { rateCardsTable } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const findAllRateCards = async () => {
    return db.select().from(rateCardsTable)
}

export const findRateCardsByZoneId = async (zoneId: string) => {
    return db
        .select()
        .from(rateCardsTable)
        .where(eq(rateCardsTable.zoneId, zoneId))
}
