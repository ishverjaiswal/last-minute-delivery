'use client'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

const ResetPasswordPage = () => {
    return (
        <div className="w-full flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetPasswordForm
                    title="Reset Password"
                    subtitle="Please enter your email to reset your password"
                    buttonLabel="Send Reset Link"
                    buttonHref="/dashboard"
                />
            </Suspense>
        </div>
    )
}

export default ResetPasswordPage
