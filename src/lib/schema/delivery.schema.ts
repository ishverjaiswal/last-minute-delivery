import { z } from 'zod'

export const createZoneSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    city: z.string().min(2, 'City must be at least 2 characters long'),
    state: z.string().min(2, 'State must be at least 2 characters long'),
    pinCodes: z
        .array(z.string().regex(/^\d+$/, 'PIN codes must contain only digits'))
        .min(1, 'At least one PIN code is required'),
})

export const createRateCardSchema = z
    .object({
        zoneId: z.string().min(1, 'Zone ID is required'),
        minWeight: z.number().min(0, 'Minimum weight must be at least 0'),
        maxWeight: z.number().positive('Maximum weight must be positive'),
        basePrice: z.number().positive('Base price must be positive'),
        orderType: z.enum(['B2B', 'B2C']).default('B2C'),
        zoneType: z.enum(['INTRA', 'INTER']).default('INTRA'),
        // Admin-configurable COD surcharge percentage (e.g. 1.5 = 1.5%)
        codSurcharge: z
            .number()
            .min(0, 'COD surcharge must be non-negative')
            .default(0),
    })
    .refine((data) => data.maxWeight > data.minWeight, {
        message: 'Maximum weight must be greater than minimum weight',
        path: ['maxWeight'],
    })

export const createAgentSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 characters long'),
    assignedZoneId: z
        .string()
        .min(1, 'Zone ID is required')
        .optional()
        .nullable(),
    availability: z.boolean().optional(),
})

export const createOrderSchema = z.object({
    pickupAddress: z
        .string()
        .min(5, 'Pickup address must be at least 5 characters long'),
    deliveryAddress: z
        .string()
        .min(5, 'Delivery address must be at least 5 characters long'),
    deliveryPinCode: z
        .string()
        .regex(/^\d+$/, 'PIN code must contain only digits'),
    weight: z.number().positive('Weight must be positive'),
    // Package dimensions in cm (optional; enables volumetric weight calculation)
    length: z.number().positive('Length must be positive').optional(),
    width: z.number().positive('Width must be positive').optional(),
    height: z.number().positive('Height must be positive').optional(),
    // Order type: B2B (business-to-business) or B2C (business-to-consumer)
    orderType: z.enum(['B2B', 'B2C']).default('B2C'),
    // Payment type: PREPAID or Cash on Delivery
    paymentType: z.enum(['PREPAID', 'COD']).default('PREPAID'),
    // Pickup PIN code for intra/inter zone detection
    pickupPinCode: z
        .string()
        .regex(/^\d+$/, 'PIN code must contain only digits')
        .optional(),
})

export const updateOrderSchema = z.object({
    status: z
        .enum([
            'PENDING',
            'CONFIRMED',
            'ASSIGNED',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
        ])
        .optional(),
    agentId: z.string().min(1, 'Agent ID is required').optional().nullable(),
})
