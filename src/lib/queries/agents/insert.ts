import { db } from '@/lib/dbconfig/db'
import {
    deliveryAgentProfilesTable,
    InsertDeliveryAgentProfile,
} from '@/lib/dbconfig/schema'

export const createAgentProfile = async (data: InsertDeliveryAgentProfile) => {
    const [profile] = await db
        .insert(deliveryAgentProfilesTable)
        .values(data)
        .returning()
    return profile
}
