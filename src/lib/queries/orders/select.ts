import { db } from '@/lib/dbconfig/db'
import { ordersTable } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const findAllOrders = async () => {
    return db.select().from(ordersTable)
}

export const findOrderById = async (id: string) => {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id))
    return order || null
}

export const findOrdersByCustomerId = async (customerId: string) => {
    return db.select().from(ordersTable).where(eq(ordersTable.customerId, customerId))
}

export const findOrdersByAgentId = async (agentId: string) => {
    return db.select().from(ordersTable).where(eq(ordersTable.agentId, agentId))
}
