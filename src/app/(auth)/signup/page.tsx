'use client'
import { SignupForm } from '@/components/auth/SignupForm'

const SignUpPage = () => {
    return (
        <div className="w-full flex items-center justify-center p-4">
            <SignupForm
                title="Create an Account"
                subtitle="Join us and start booking parcel deliveries."
                buttonLabel="Create Account"
                buttonHref="/dashboard"
            />
        </div>
    )
}

export default SignUpPage
