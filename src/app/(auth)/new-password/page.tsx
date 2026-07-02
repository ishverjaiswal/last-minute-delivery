'use client'
import { Suspense } from 'react'
import { NewPasswordForm } from '@/components/auth/NewPasswordForm'

const NewPasswordPage = ({}) => {
    return (
        <div className="min-h-screen flex items-center justify-center  from-neutral-900 to-black p-4">
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
