import { db } from '@/lib/dbconfig/db'
import { ordersTable, usersTable, deliveryAgentProfilesTable, zonesTable } from '@/lib/dbconfig/schema'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

const customers = alias(usersTable, 'customer')
const agentUsers = alias(usersTable, 'agentUser')

const selectWithDetails = () => {
    return db
        .select({
            id: ordersTable.id,
            customerId: ordersTable.customerId,
            pickupAddress: ordersTable.pickupAddress,
            deliveryAddress: ordersTable.deliveryAddress,
            deliveryPinCode: ordersTable.deliveryPinCode,
            weight: ordersTable.weight,
            zoneId: ordersTable.zoneId,
            rateCardId: ordersTable.rateCardId,
            agentId: ordersTable.agentId,
            status: ordersTable.status,
            price: ordersTable.price,
            createdAt: ordersTable.createdAt,
            updatedAt: ordersTable.updatedAt,
            
            // Customer details
            customerName: customers.name,
            customerEmail: customers.email,

            // Agent details
            agentName: agentUsers.name,
            agentEmail: agentUsers.email,
            agentPhone: deliveryAgentProfilesTable.phone,

            // Zone details
            zoneName: zonesTable.name,
        })
        .from(ordersTable)
        .leftJoin(customers, eq(ordersTable.customerId, customers.id))
        .leftJoin(deliveryAgentProfilesTable, eq(ordersTable.agentId, deliveryAgentProfilesTable.id))
        .leftJoin(agentUsers, eq(deliveryAgentProfilesTable.userId, agentUsers.id))
        .leftJoin(zonesTable, eq(ordersTable.zoneId, zonesTable.id))
}

export const findAllOrders = async () => {
    return selectWithDetails()
}

export const findOrderById = async (id: string) => {
    const [order] = await selectWithDetails().where(eq(ordersTable.id, id))
    return order || null
}

export const findOrdersByCustomerId = async (customerId: string) => {
    return selectWithDetails().where(eq(ordersTable.customerId, customerId))
}

export const findOrdersByAgentId = async (agentId: string) => {
    return selectWithDetails().where(eq(ordersTable.agentId, agentId))
}
