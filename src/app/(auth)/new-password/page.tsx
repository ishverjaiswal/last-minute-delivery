'use client'
import { Suspense } from 'react'
import { NewPasswordForm } from '@/components/auth/NewPasswordForm'

const NewPasswordPage = () => {
    return (
        <div className="w-full flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <NewPasswordForm
                    title="New Password"
                    subtitle="Please enter your new password"
                    buttonLabel="Set New Password"
                    buttonHref="/dashboard"
                />
            </Suspense>
        </div>
    )
}

export default NewPasswordPage
