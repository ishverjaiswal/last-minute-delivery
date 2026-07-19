/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * POST /api/orders/preview
 *
 * Runs the full rate engine and returns a pricing breakdown
 * WITHOUT creating an order. Used by the UI to show the customer
 * actual weight, volumetric weight, billable weight, rate, COD
 * surcharge, and total before they confirm the booking.
 */
import { auth } from '@/auth'
import { billingService } from '@/services/billing.service'
import { createOrderSchema } from '@/lib/schema/delivery.schema'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Auth required' },
            },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()

        // Re-use the same Zod schema – no extra validation needed
        const parsed = createOrderSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid fields',
                        details: parsed.error.flatten(),
                    },
                },
                { status: 400 }
            )
        }

        const pricing = await billingService.calculateOrderPrice({
            deliveryPinCode: parsed.data.deliveryPinCode,
            pickupPinCode: parsed.data.pickupPinCode,
            weight: parsed.data.weight,
            length: parsed.data.length,
            width: parsed.data.width,
            height: parsed.data.height,
            orderType: parsed.data.orderType ?? 'B2C',
            paymentType: parsed.data.paymentType ?? 'PREPAID',
        })

        return NextResponse.json({
            success: true,
            data: {
                zone: pricing.zoneName,
                zoneType: pricing.zoneType,
                actualWeight: pricing.actualWeight,
                volumetricWeight: pricing.volumetricWeight,
                billableWeight: pricing.billableWeight,
                appliedRate: pricing.appliedRate,
                surcharge: pricing.surchargeAmount,
                total: pricing.totalPrice,
            },
        })
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'BUSINESS_RULE_VIOLATION',
                    message: err.message,
                },
            },
            { status: 422 }
        )
    }
}
