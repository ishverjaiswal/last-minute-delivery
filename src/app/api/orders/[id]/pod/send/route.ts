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

        const result = await ProofOfDeliveryService.sendDeliveryOtp(
            id,
            session.user.id
        )

        return NextResponse.json({
            success: true,
            data: {
                otpRecord: result.otpRecord,
                otp: result.rawOtp,
                recipientEmail: result.recipientEmail,
            },
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
