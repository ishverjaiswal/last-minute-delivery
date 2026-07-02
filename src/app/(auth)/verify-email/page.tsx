'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import FormError from '@/components/auth/ui/form-error'
import FormSuccess from '@/components/auth/ui/form-success'
import axios from 'axios'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const initialError = !token
        ? 'Invalid verification link. Token is missing.'
        : ''
    const [loading, setLoading] = useState(!initialError)
    const [error, setError] = useState<string>(initialError)
    const [success, setSuccess] = useState<string>('')
    const [resending, setResending] = useState(false)

    useEffect(() => {
        if (!token) {
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await axios.post(
                    '/api/auth/verify-email',
                    {
                        token,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const data = response.data

                setSuccess(
                    data.message ||
                        'Email verified successfully! Redirecting to login...'
                )
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const message =
                        err.response?.data?.message || 'Failed to verify email.'
                    setError(message)
                } else {
                    setError('An error occurred while verifying your email.')
                }
            } finally {
                setLoading(false)
            }
        }

        verifyEmail()
    }, [token, router])

    const handleResendEmail = () => {
        setResending(true)
        // Redirect to login page where they can try to login and trigger resend
        router.push('/login')
    }

    return (
        <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-850 p-8 shadow-2xl text-white">
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-extrabold text-white">
                    Email Verification
                </h1>

                {loading && (
                    <div className="my-8 flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-indigo-500" />
                    </div>
                )}

                {!loading && (
                    <div className="my-6">
                        <FormError message={error} />
                        <FormSuccess message={success} />
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-6 flex flex-col gap-4">
                        <Button
                            onClick={handleResendEmail}
                            disabled={resending}
                            className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold"
                        >
                            {resending
                                ? 'Redirecting...'
                                : 'Request New Verification Email'}
                        </Button>
                        <Button
                            onClick={() => router.push('/login')}
                            variant="outline"
                            className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                        >
                            Back to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center text-white">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    )
}
