import { createOrder } from '@/lib/queries/orders/insert'
import { findAllOrders, findOrderById, findOrdersByCustomerId, findOrdersByAgentId } from '@/lib/queries/orders/select'
import { updateOrder } from '@/lib/queries/orders/update'
import { billingService } from './billing.service'
import { statusHistoryService } from './status-history.service'

export const orderService = {
    createNewOrder: async (
        customerId: string,
        payload: {
            pickupAddress: string
            deliveryAddress: string
            deliveryPinCode: string
            weight: number
        }
    ) => {
        // Calculate price and find corresponding zone & rate card
        const priceInfo = await billingService.calculateOrderPrice(payload.deliveryPinCode, payload.weight)

        // Create order in DB with PENDING status
        const order = await createOrder({
            customerId,
            pickupAddress: payload.pickupAddress,
            deliveryAddress: payload.deliveryAddress,
            deliveryPinCode: payload.deliveryPinCode,
            weight: payload.weight,
            zoneId: priceInfo.zoneId,
            rateCardId: priceInfo.rateCardId,
            status: 'PENDING',
            price: priceInfo.price,
        })

        // Log PENDING state to history
        await statusHistoryService.logStatusChange(order.id, 'PENDING', customerId)

        return order
    },

    getOrdersByRole: async (userId: string, role: string) => {
        if (role === 'ADMIN') {
            return findAllOrders()
        } else if (role === 'DELIVERY_AGENT') {
            // Find driver profile first
            const { findAgentByUserId } = await import('@/lib/queries/agents/select')
            const agent = await findAgentByUserId(userId)
            if (!agent) return []
            return findOrdersByAgentId(agent.id)
        } else {
            // Customer
            return findOrdersByCustomerId(userId)
        }
    },

    getOrderDetail: async (id: string) => {
        return findOrderById(id)
    },

    assignCourier: async (id: string, agentId: string, updatedById: string) => {
        const order = await findOrderById(id)
        if (!order) {
            throw new Error('Order not found')
        }

        // Validate agent existence and availability
        const { findAgentById } = await import('@/lib/queries/agents/select')
        const agent = await findAgentById(agentId)
        if (!agent) {
            throw new Error('Delivery agent profile not found')
        }
        if (!agent.availability) {
            throw new Error('This delivery agent is currently unavailable')
        }

        const updated = await updateOrder(id, {
            agentId,
            status: 'ASSIGNED',
        })

        await statusHistoryService.logStatusChange(id, 'ASSIGNED', updatedById)
        return updated
    },

    updateStatus: async (id: string, status: string, updatedById: string) => {
        const order = await findOrderById(id)
        if (!order) {
            throw new Error('Order not found')
        }

        // Check valid statuses
        const validStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid order status: ${status}`)
        }

        const updated = await updateOrder(id, { status })
        await statusHistoryService.logStatusChange(id, status, updatedById)
        return updated
    },
}
