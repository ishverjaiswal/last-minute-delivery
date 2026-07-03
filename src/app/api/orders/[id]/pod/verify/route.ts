/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth'
import { ProofOfDeliveryService } from '@/services/proof-of-delivery.service'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params

        if (
            session.user.role !== 'DELIVERY_AGENT' &&
            session.user.role !== 'ADMIN'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Access denied' },
                },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { otp } = body as { otp?: string }

        if (!otp || otp.trim().length !== 6) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message:
                            'Invalid verification code format. Code must be 6 digits.',
                    },
                },
                { status: 400 }
            )
        }

        await ProofOfDeliveryService.verifyDeliveryOtp(
            id,
            otp.trim(),
            session.user.id
        )

        return NextResponse.json({
            success: true,
            message:
                'Proof of Delivery verified and status updated successfully.',
        })
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: { code: 'BAD_REQUEST', message: err.message },
            },
            { status: 400 }
        )
    }
}
