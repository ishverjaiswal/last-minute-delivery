'use client'
import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { IconX, IconEye, IconEyeOff } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { NewPasswordFormSchema } from '@/lib/schema/authSchema'
import FormError from '@/components/auth/ui/form-error'
import FormSuccess from '@/components/auth/ui/form-success'
import axios from 'axios'

interface NewPasswordFormProps {
    title?: string
    subtitle?: string
    buttonLabel?: string
    buttonHref?: string
    isModal?: boolean
}

export function NewPasswordForm({
    title,
    subtitle,
    buttonLabel,
    isModal = false,
}: NewPasswordFormProps) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    type NewPasswordValues = z.infer<typeof NewPasswordFormSchema>

    const form = useForm<NewPasswordValues>({
        resolver: zodResolver(NewPasswordFormSchema),
        mode: 'onChange',
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: NewPasswordValues) => {
        setSuccess('')
        setError('')

        if (!token) {
            setError('Invalid reset link. Token is missing.')
            return
        }

        startTransition(async () => {
            try {
                const response = await axios.post(
                    '/api/auth/new-password',
                    {
                        token,
                        password: values.password,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const message =
                    response.data?.message ?? 'Password reset successfully!'
                setSuccess(message)

                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const message =
                        err.response?.data?.message ??
                        'Unable to reset password. Please try again.'
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

    const submitLabel = buttonLabel ?? 'Reset Password'

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
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="premium-form-group">
                            <Label
                                htmlFor="password"
                                className="premium-form-label"
                            >
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-neutral-200 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <IconEyeOff className="h-4 w-4" />
                                    ) : (
                                        <IconEye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {fieldState.invalid && (
                                <p className="premium-form-error">
                                    {fieldState.error?.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="premium-form-group">
                            <Label
                                htmlFor="confirmPassword"
                                className="premium-form-label"
                            >
                                Confirm Password{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="new-password"
                                    disabled={isPending}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-neutral-200 cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <IconEyeOff className="h-4 w-4" />
                                    ) : (
                                        <IconEye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {fieldState.invalid && (
                                <p className="premium-form-error">
                                    {fieldState.error?.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                <div className="my-2">
                    {error && <FormError message={error} />}
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
                            Resetting Password...
                        </span>
                    ) : (
                        submitLabel
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-neutral-400">
                Don&apos;t have an account?{' '}
                <button
                    type="button"
                    onClick={() => router.replace('/signup')}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                    Sign Up
                </button>
            </div>
        </div>
    )
}

export default NewPasswordForm
