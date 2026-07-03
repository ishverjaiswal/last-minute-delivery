import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { DeliveryOtpRepository } from '@/lib/queries/delivery-otps/delivery-otp.repository'
import { updateOrder } from '@/lib/queries/orders/update'
import { findOrderById } from '@/lib/queries/orders/select'
import { statusHistoryService } from './status-history.service'
import { getNotificationProvider } from './notifications/notification-provider'

export const ProofOfDeliveryService = {
    generateOTP: (): string => {
        const bytes = crypto.randomBytes(3)
        const number = parseInt(bytes.toString('hex'), 16) % 1000000
        return number.toString().padStart(6, '0')
    },

    hashOTP: async (otp: string): Promise<string> => {
        return bcrypt.hash(otp, 10)
    },

    sendDeliveryOtp: async (orderId: string, agentUserId: string) => {
        const order = await findOrderById(orderId)
        if (!order) {
            throw new Error('Order not found')
        }

        const { findUserById } = await import('@/lib/queries/users/select')
        const customer = await findUserById(order.customerId)
        const customerEmail = customer?.email || 'demo.customer@example.com'
        
        let customerPhone = '+91 9876543210'
        const phoneMatch = order.deliveryAddress.match(/\((.*?)\)/)
        if (phoneMatch && phoneMatch[1]) {
            customerPhone = phoneMatch[1]
        }

        const activeOtp = await DeliveryOtpRepository.findActiveOtpByOrderId(orderId)
        const newResendCount = activeOtp ? activeOtp.resentCount + 1 : 0

        await DeliveryOtpRepository.invalidateAllOtpsForOrder(orderId)

        const otp = ProofOfDeliveryService.generateOTP()
        const otpHash = await ProofOfDeliveryService.hashOTP(otp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        const dbOtp = await DeliveryOtpRepository.createOtp({
            orderId,
            otpHash,
            expiresAt,
            resentCount: newResendCount,
            createdBy: agentUserId,
        })

        if (newResendCount > 0) {
            await statusHistoryService.logStatusChange(orderId, 'OTP Resent', agentUserId)
        } else {
            await statusHistoryService.logStatusChange(orderId, 'OTP Generated', agentUserId)
        }
        await statusHistoryService.logStatusChange(orderId, 'OTP Sent', agentUserId)

        const provider = getNotificationProvider()
        await provider.sendOTP(customerEmail, customerPhone, otp)

        return {
            otpRecord: dbOtp,
            rawOtp: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? otp : null,
            recipientEmail: customerEmail,
        }
    },

    verifyDeliveryOtp: async (orderId: string, otp: string, agentUserId: string) => {
        const activeOtp = await DeliveryOtpRepository.findActiveOtpByOrderId(orderId)
        if (!activeOtp) {
            throw new Error('No active verification code found for this order. Please send OTP first.')
        }

        if (activeOtp.verified) {
            throw new Error('Delivery already verified.')
        }

        if (activeOtp.attemptCount >= 5) {
            throw new Error('Maximum attempts exceeded. Please resend OTP.')
        }

        const isExpired = new Date(activeOtp.expiresAt) < new Date()
        if (isExpired) {
            // Also update in db to make it expired explicitly if needed
            throw new Error('Verification code expired.')
        }

        const isMatch = await bcrypt.compare(otp, activeOtp.otpHash)
        if (!isMatch) {
            await DeliveryOtpRepository.incrementAttempts(activeOtp.id, activeOtp.attemptCount)
            const remaining = 5 - (activeOtp.attemptCount + 1)
            if (remaining <= 0) {
                throw new Error('Invalid verification code. Maximum attempts exceeded. Please resend OTP.')
            }
            throw new Error(`Invalid verification code. ${remaining} attempts remaining.`)
        }

        await DeliveryOtpRepository.verifyOtp(activeOtp.id, agentUserId)

        await updateOrder(orderId, { status: 'DELIVERED' })

        await statusHistoryService.logStatusChange(orderId, 'OTP Verified', agentUserId)
        await statusHistoryService.logStatusChange(orderId, 'Delivery Completed', agentUserId)

        return { success: true }
    },
}
