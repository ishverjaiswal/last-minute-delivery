import { Resend } from 'resend'
import {
    VerificationEmailTemplate,
    VerificationEmailText,
} from '@/lib/mail/verification-email'
import { ResetEmailTemplate, ResetEmailText } from '@/lib/mail/reset-email'
import {
    TwoFactorEmailTemplate,
    TwoFactorEmailText,
} from '@/lib/mail/two-factor-email'

const resend = process.env.RESEND_API_KEY?.trim()
    ? new Resend(process.env.RESEND_API_KEY)
    : null

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const sendPasswordResetEmail = async (
    email: string,
    token: string,
    userName?: string
) => {
    const resetLink = `${DOMAIN}/new-password?token=${token}`

    if (!resend) {
        console.warn(
            'RESEND_API_KEY is not configured; skipping password reset email delivery.'
        )
        return {
            success: false,
            error: new Error('RESEND_API_KEY is not configured'),
        }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Last Mile Delivery Tracker <onboarding@resend.dev>',
            to: 'ishverjaiswal40@gmail.com',
            subject: 'Reset Your Password - Last Mile Delivery Tracker',
            html: ResetEmailTemplate({
                userName: userName || email.split('@')[0],
                resetLink,
            }),
            text: ResetEmailText(userName || email.split('@')[0], resetLink),
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error }
        }

        console.log('Password reset email sent successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Failed to send password reset email:', error)
        return { success: false, error }
    }
}
export const sendVerificationEmail = async (
    email: string,
    token: string,
    userName?: string
) => {
    const confirmLink = `${DOMAIN}/verify-email?token=${token}`

    if (!resend) {
        console.warn(
            'RESEND_API_KEY is not configured; skipping verification email delivery.'
        )
        return {
            success: false,
            error: new Error('RESEND_API_KEY is not configured'),
        }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Last Mile Delivery Tracker <onboarding@resend.dev>',
            to: 'ishverjaiswal40@gmail.com',
            subject: 'Verify Your Email Address - Last Mile Delivery Tracker',
            html: VerificationEmailTemplate({
                userName: userName || email.split('@')[0],
                verificationLink: confirmLink,
            }),
            text: VerificationEmailText(
                userName || email.split('@')[0],
                confirmLink
            ),
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error }
        }

        console.log('Verification email sent successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Failed to send verification email:', error)
        return { success: false, error }
    }
}
export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string,
    userName?: string
) => {
    if (!resend) {
        console.warn(
            'RESEND_API_KEY is not configured; skipping two-factor email delivery.'
        )
        return {
            success: false,
            error: new Error('RESEND_API_KEY is not configured'),
        }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Last Mile Delivery Tracker <onboarding@resend.dev>',
            to: 'ishverjaiswal40@gmail.com',
            subject:
                'Your Two-Factor Authentication Code - Last Mile Delivery Tracker',
            html: TwoFactorEmailTemplate({
                userName: userName || email.split('@')[0],
                token,
            }),
            text: TwoFactorEmailText(userName || email.split('@')[0], token),
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error }
        }

        console.log('Two-factor email sent successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Failed to send two-factor email:', error)
        return { success: false, error }
    }
}
