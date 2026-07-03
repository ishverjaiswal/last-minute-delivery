import { db } from '@/lib/dbconfig/db'
import { rateCardsTable, InsertRateCard } from '@/lib/dbconfig/schema'

export const createRateCard = async (data: InsertRateCard) => {
    const [newRateCard] = await db
        .insert(rateCardsTable)
        .values(data)
        .returning()
    return newRateCard
}
