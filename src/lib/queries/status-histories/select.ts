import { db } from '@/lib/dbconfig/db'
import { orderStatusHistoryTable, usersTable } from '@/lib/dbconfig/schema'
import { eq, desc } from 'drizzle-orm'

export const findHistoryByOrderId = async (orderId: string) => {
    return db
        .select({
            id: orderStatusHistoryTable.id,
            orderId: orderStatusHistoryTable.orderId,
            status: orderStatusHistoryTable.status,
            changedById: orderStatusHistoryTable.changedById,
            changedByName: usersTable.name,
            createdAt: orderStatusHistoryTable.createdAt,
        })
        .from(orderStatusHistoryTable)
        .leftJoin(usersTable, eq(orderStatusHistoryTable.changedById, usersTable.id))
        .where(eq(orderStatusHistoryTable.orderId, orderId))
        .orderBy(desc(orderStatusHistoryTable.createdAt))
}
