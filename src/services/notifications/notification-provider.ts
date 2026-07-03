export interface NotificationProvider {
    sendOTP(email: string, phone: string, otp: string): Promise<void>
}

export class DemoNotificationProvider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        console.log(`[DEMO NOTIFICATION] OTP for ${email} (${phone}) is: ${otp}`)
    }
}

export class EmailNotificationProvider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        const { Resend } = await import('resend')
        const resendApiKey = process.env.RESEND_API_KEY?.trim()
        if (!resendApiKey) {
            console.warn('RESEND_API_KEY is not configured; skipping email dispatch.')
            return
        }
        const resend = new Resend(resendApiKey)

        const emailText = `Hello,

Your parcel is now out for delivery.

Your verification code is

${otp}

Please provide this code to the delivery agent.

This OTP expires in 10 minutes.

If you did not request this delivery, ignore this message.`

        const emailHtml = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <p>Hello,</p>
            <p>Your parcel is now out for delivery.</p>
            <p>Your verification code is</p>
            <h2 style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #4f46e5; margin: 20px 0;">${otp}</h2>
            <p>Please provide this code to the delivery agent.</p>
            <p>This OTP expires in 10 minutes.</p>
            <p style="font-size: 12px; color: #7f7f7f; margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 10px;">If you did not request this delivery, ignore this message.</p>
        </div>`

        try {
            await resend.emails.send({
                from: 'Last Mile Delivery Tracker <onboarding@resend.dev>',
                to: 'ishverjaiswal40@gmail.com',
                subject: 'Delivery Verification Code',
                html: emailHtml,
                text: emailText,
            })
            console.log(`[EMAIL NOTIFICATION] Sent OTP via Resend to ${email}`)
        } catch (err) {
            console.error('Failed to send Resend OTP email:', err)
        }
    }
}

export class TwilioProvider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        console.log(`[Twilio SMS Stub] Sending OTP ${otp} to ${phone}`)
    }
}

export class MSG91Provider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        console.log(`[MSG91 SMS Stub] Sending OTP ${otp} to ${phone}`)
    }
}

export class Fast2SMSProvider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        console.log(`[Fast2SMS Stub] Sending OTP ${otp} to ${phone}`)
    }
}

export class AwsSNSProvider implements NotificationProvider {
    async sendOTP(email: string, phone: string, otp: string): Promise<void> {
        console.log(`[AwsSNS SMS Stub] Sending OTP ${otp} to ${phone}`)
    }
}

export function getNotificationProvider(): NotificationProvider {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    if (isDemoMode) {
        return new DemoNotificationProvider()
    }
    return new EmailNotificationProvider()
}
