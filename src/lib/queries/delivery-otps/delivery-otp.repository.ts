import { db } from '@/lib/dbconfig/db'
import { deliveryOtpsTable } from '@/lib/dbconfig/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { InsertDeliveryOtp } from '@/lib/dbconfig/schema'

export const DeliveryOtpRepository = {
    createOtp: async (data: InsertDeliveryOtp) => {
        const [otp] = await db
            .insert(deliveryOtpsTable)
            .values(data)
            .returning()
        return otp
    },

    findActiveOtpByOrderId: async (orderId: string) => {
        const [otp] = await db
            .select()
            .from(deliveryOtpsTable)
            .where(
                and(
                    eq(deliveryOtpsTable.orderId, orderId),
                    eq(deliveryOtpsTable.verified, false)
                )
            )
            .orderBy(desc(deliveryOtpsTable.createdAt))
            .limit(1)
        return otp || null
    },

    invalidateAllOtpsForOrder: async (orderId: string) => {
        return db
            .delete(deliveryOtpsTable)
            .where(
                and(
                    eq(deliveryOtpsTable.orderId, orderId),
                    eq(deliveryOtpsTable.verified, false)
                )
            )
    },

    verifyOtp: async (id: string, verifiedById: string) => {
        const [otp] = await db
            .update(deliveryOtpsTable)
            .set({
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: verifiedById,
            })
            .where(eq(deliveryOtpsTable.id, id))
            .returning()
        return otp
    },

    incrementAttempts: async (id: string, currentAttempts: number) => {
        const [otp] = await db
            .update(deliveryOtpsTable)
            .set({
                attemptCount: currentAttempts + 1,
            })
            .where(eq(deliveryOtpsTable.id, id))
            .returning()
        return otp
    },

    incrementResendCount: async (
        id: string,
        currentResendCount: number,
        newOtpHash: string,
        newExpiresAt: Date
    ) => {
        const [otp] = await db
            .update(deliveryOtpsTable)
            .set({
                otpHash: newOtpHash,
                expiresAt: newExpiresAt,
                attemptCount: 0,
                resentCount: currentResendCount + 1,
            })
            .where(eq(deliveryOtpsTable.id, id))
            .returning()
        return otp
    },

    expireOtp: async (id: string) => {
        const [otp] = await db
            .update(deliveryOtpsTable)
            .set({
                expiresAt: new Date(0),
            })
            .where(eq(deliveryOtpsTable.id, id))
            .returning()
        return otp
    },
}
