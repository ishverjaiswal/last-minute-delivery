import { db } from '@/lib/dbconfig/db'
import { orderStatusHistoryTable, InsertOrderStatusHistory } from '@/lib/dbconfig/schema'

export const createStatusHistory = async (data: InsertOrderStatusHistory) => {
    const [history] = await db.insert(orderStatusHistoryTable).values(data).returning()
    return history
}
