import { createOrder } from '@/lib/queries/orders/insert'
import {
    findAllOrders,
    findOrderById,
    findOrdersByCustomerId,
    findOrdersByAgentId,
} from '@/lib/queries/orders/select'
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
            length?: number
            width?: number
            height?: number
            orderType?: 'B2B' | 'B2C'
            paymentType?: 'PREPAID' | 'COD'
            pickupPinCode?: string
        }
    ) => {
        const {
            pickupAddress,
            deliveryAddress,
            deliveryPinCode,
            weight,
            length,
            width,
            height,
            orderType = 'B2C',
            paymentType = 'PREPAID',
            pickupPinCode,
        } = payload

        // ── Calculate full pricing breakdown ───────────────────────────────────
        const pricing = await billingService.calculateOrderPrice({
            deliveryPinCode,
            pickupPinCode,
            weight,
            length,
            width,
            height,
            orderType,
            paymentType,
        })

        // ── Create order in DB with PENDING status ─────────────────────────────
        const order = await createOrder({
            customerId,
            pickupAddress,
            deliveryAddress,
            deliveryPinCode,
            weight,
            length: length ?? null,
            width: width ?? null,
            height: height ?? null,
            volumetricWeight: pricing.volumetricWeight,
            billableWeight: pricing.billableWeight,
            orderType,
            paymentType,
            codSurchargeAmount: pricing.surchargeAmount,
            pickupPinCode: pickupPinCode ?? null,
            pickupZoneId: pricing.pickupZoneId,
            zoneId: pricing.zoneId,
            rateCardId: pricing.rateCardId,
            status: 'PENDING',
            price: pricing.totalPrice,
        })

        // ── Log PENDING state to status history ────────────────────────────────
        await statusHistoryService.logStatusChange(
            order.id,
            'PENDING',
            customerId
        )

        return order
    },

    getOrdersByRole: async (userId: string, role: string) => {
        if (role === 'ADMIN') {
            return findAllOrders()
        } else if (role === 'DELIVERY_AGENT') {
            // Find driver profile first
            const { findAgentByUserId } =
                await import('@/lib/queries/agents/select')
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
        const validStatuses = [
            'PENDING',
            'CONFIRMED',
            'ASSIGNED',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
        ]
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid order status: ${status}`)
        }

        if (status === 'DELIVERED') {
            throw new Error(
                'A parcel can never become DELIVERED unless verified via OTP.'
            )
        }

        const updated = await updateOrder(id, { status })
        await statusHistoryService.logStatusChange(id, status, updatedById)
        return updated
    },
}
