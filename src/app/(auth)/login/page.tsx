'use client'
import { Suspense } from 'react'
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton'
import { LoginForm } from '@/components/auth/LoginForm'

const LogInPage = () => {
    return (
        <div className="w-full flex items-center justify-center p-4">
            <Suspense fallback={<AuthFormSkeleton />}>
                <LoginForm
                    title="Welcome Back"
                    subtitle="Please enter your credentials to log in."
                    buttonLabel="Log In"
                    buttonHref="/dashboard"
                />
            </Suspense>
        </div>
    )
}

export default LogInPage
