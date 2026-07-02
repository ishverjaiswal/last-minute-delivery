import { db } from '@/lib/dbconfig/db'
import { deliveryAgentProfilesTable, SelectDeliveryAgentProfile } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const updateAgentProfile = async (
    id: string,
    data: Partial<Omit<SelectDeliveryAgentProfile, 'id' | 'userId' | 'createdAt'>>
) => {
    const [updated] = await db
        .update(deliveryAgentProfilesTable)
        .set(data)
        .where(eq(deliveryAgentProfilesTable.id, id))
        .returning()
    return updated || null
}
