import { db } from '@/lib/dbconfig/db'
import { ordersTable, InsertOrder } from '@/lib/dbconfig/schema'

export const createOrder = async (data: InsertOrder) => {
    const [newOrder] = await db.insert(ordersTable).values(data).returning()
    return newOrder
}
