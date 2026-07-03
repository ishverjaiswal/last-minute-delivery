'use client'
import React, { useState, useTransition } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { IconX } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ResetPasswordFormSchema } from '@/lib/schema/authSchema'
import FormError from '@/components/auth/ui/form-error'
import FormSuccess from '@/components/auth/ui/form-success'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

interface ResetPasswordFormProps {
    title?: string
    subtitle?: string
    buttonLabel?: string
    buttonHref?: string
    isModal?: boolean
}

export function ResetPasswordForm({
    title,
    subtitle,
    buttonLabel,
    isModal = false,
}: ResetPasswordFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')
    const searchParams = useSearchParams()
    const urlError =
        searchParams.get('error') === 'OAuthAccountNotLinked'
            ? 'Your email is already in use. Please use another email'
            : ''

    type ResetPasswordValues = z.infer<typeof ResetPasswordFormSchema>

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(ResetPasswordFormSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (values: ResetPasswordValues) => {
        setSuccess('')
        setError('')

        startTransition(async () => {
            try {
                const response = await axios.post(
                    '/api/auth/reset-password',
                    values,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const message =
                    response.data?.message ??
                    'Password reset link has been sent.'
                setSuccess(message)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const message =
                        err.response?.data?.message ??
                        'Unable to process the request.'
                    setError(message)
                } else {
                    setError('An unexpected error occurred. Please try again.')
                }
            }
        })
    }

    const handleClose = () => {
        router.push('/')
    }

    const submitLabel = buttonLabel ?? 'Send Reset Link'

    return (
        <div
            className={cn(
                'w-full max-w-md mx-auto relative text-white',
                isModal ? 'bg-transparent p-0' : 'premium-card'
            )}
        >
            {!isModal && (
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Close"
                    type="button"
                >
                    <IconX className="h-4 w-4 text-neutral-400" />
                </button>
            )}

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold tracking-tight text-neutral-200">
                    {title}
                </h2>
                <p className="mt-2 text-xs text-neutral-400">{subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="premium-form-group">
                            <Label
                                htmlFor="email"
                                className="premium-form-label"
                            >
                                Email Address{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                placeholder="projectmayhem@fc.com"
                                type="email"
                                {...field}
                                aria-invalid={fieldState.invalid}
                                autoComplete="email"
                                disabled={isPending}
                            />
                            {fieldState.invalid && (
                                <p className="premium-form-error">
                                    {fieldState.error?.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                <div className="my-2">
                    {error && <FormError message={error || urlError} />}
                    {success && <FormSuccess message={success} />}
                </div>

                <button
                    className="premium-button-primary w-full h-10 select-none"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent animate-spin rounded-full" />
                            Sending Link...
                        </span>
                    ) : (
                        submitLabel
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-neutral-400 font-medium">
                Don&apos;t have an account?{' '}
                <button
                    type="button"
                    onClick={() => {
                        router.replace('/signup')
                    }}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                    Sign Up
                </button>
            </div>
        </div>
    )
}

export default ResetPasswordForm
