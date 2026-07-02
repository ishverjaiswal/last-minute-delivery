import { db } from '@/lib/dbconfig/db'
import { ordersTable, SelectOrder } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const updateOrder = async (
    id: string,
    data: Partial<Omit<SelectOrder, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>
) => {
    const [updated] = await db
        .update(ordersTable)
        .set(data)
        .where(eq(ordersTable.id, id))
        .returning()
    return updated || null
}
