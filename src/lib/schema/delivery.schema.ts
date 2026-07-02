import { z } from 'zod'

export const createZoneSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    city: z.string().min(2, 'City must be at least 2 characters long'),
    state: z.string().min(2, 'State must be at least 2 characters long'),
    pinCodes: z.array(z.string().regex(/^\d+$/, 'PIN codes must contain only digits')).min(1, 'At least one PIN code is required'),
})

export const createRateCardSchema = z.object({
    zoneId: z.string().min(1, 'Zone ID is required'),
    minWeight: z.number().min(0, 'Minimum weight must be at least 0'),
    maxWeight: z.number().positive('Maximum weight must be positive'),
    basePrice: z.number().positive('Base price must be positive'),
}).refine((data) => data.maxWeight > data.minWeight, {
    message: 'Maximum weight must be greater than minimum weight',
    path: ['maxWeight'],
})

export const createAgentSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters long'),
    assignedZoneId: z.string().min(1, 'Zone ID is required').optional().nullable(),
    availability: z.boolean().optional(),
})

export const createOrderSchema = z.object({
    pickupAddress: z.string().min(5, 'Pickup address must be at least 5 characters long'),
    deliveryAddress: z.string().min(5, 'Delivery address must be at least 5 characters long'),
    deliveryPinCode: z.string().regex(/^\d+$/, 'PIN code must contain only digits'),
    weight: z.number().positive('Weight must be positive'),
})

export const updateOrderSchema = z.object({
    status: z.enum([
        'PENDING',
        'CONFIRMED',
        'ASSIGNED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
    ]).optional(),
    agentId: z.string().min(1, 'Agent ID is required').optional().nullable(),
})
