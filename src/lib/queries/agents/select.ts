import { db } from '@/lib/dbconfig/db'
import { deliveryAgentProfilesTable, usersTable } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'

export const findAllAgents = async () => {
    return db
        .select({
            id: deliveryAgentProfilesTable.id,
            userId: deliveryAgentProfilesTable.userId,
            phone: deliveryAgentProfilesTable.phone,
            assignedZoneId: deliveryAgentProfilesTable.assignedZoneId,
            availability: deliveryAgentProfilesTable.availability,
            name: usersTable.name,
            email: usersTable.email,
        })
        .from(deliveryAgentProfilesTable)
        .innerJoin(
            usersTable,
            eq(deliveryAgentProfilesTable.userId, usersTable.id)
        )
}

export const findAgentById = async (id: string) => {
    const [agent] = await db
        .select({
            id: deliveryAgentProfilesTable.id,
            userId: deliveryAgentProfilesTable.userId,
            phone: deliveryAgentProfilesTable.phone,
            assignedZoneId: deliveryAgentProfilesTable.assignedZoneId,
            availability: deliveryAgentProfilesTable.availability,
            name: usersTable.name,
            email: usersTable.email,
        })
        .from(deliveryAgentProfilesTable)
        .innerJoin(
            usersTable,
            eq(deliveryAgentProfilesTable.userId, usersTable.id)
        )
        .where(eq(deliveryAgentProfilesTable.id, id))
    return agent || null
}

export const findAgentByUserId = async (userId: string) => {
    const [agent] = await db
        .select()
        .from(deliveryAgentProfilesTable)
        .where(eq(deliveryAgentProfilesTable.userId, userId))
    return agent || null
}
