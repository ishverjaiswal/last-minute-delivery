 
'use client'
import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    IconBrandGithub,
    IconBrandGoogle,
    IconBrandLinkedin,
    IconEye,
    IconEyeOff,
    IconX,
} from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { SignupFormSchema } from '@/lib/schema/authSchema'
import FormError from '@/components/auth/ui/form-error'
import FormSuccess from '@/components/auth/ui/form-success'
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/route'

interface SignupFormProps {
    title?: string
    subtitle?: string
    buttonLabel?: string
    buttonHref?: string
    isModal?: boolean
}

export function SignupForm({
    title,
    subtitle,
    buttonLabel,
    isModal = false,
}: SignupFormProps) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')

    type SignupValues = z.infer<typeof SignupFormSchema>

    const form = useForm<SignupValues>({
        resolver: zodResolver(SignupFormSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: SignupValues) => {
        setSuccess('')
        setError('')

        startTransition(async () => {
            try {
                const response = await axios.post(
                    '/api/auth/signup',
                    {
                        firstName: values.firstName,
                        lastName: values.lastName,
                        email: values.email,
                        password: values.password,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const message =
                    response.data?.message ??
                    'Account created successfully. Please check your email to verify.'
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

    const onClickSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT })
    }

    const submitLabel = buttonLabel ?? 'Sign Up'

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
                <div className="flex flex-col sm:flex-row gap-4">
                    <Controller
                        name="firstName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div className="premium-form-group flex-1">
                                <Label
                                    htmlFor="firstName"
                                    className="premium-form-label"
                                >
                                    First Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    placeholder="Tyler"
                                    type="text"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="given-name"
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
                    <Controller
                        name="lastName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div className="premium-form-group flex-1">
                                <Label
                                    htmlFor="lastName"
                                    className="premium-form-label"
                                >
                                    Last Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    placeholder="Durden"
                                    type="text"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="family-name"
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
                </div>

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
                            Creating Account...
                        </span>
                    ) : (
                        submitLabel
                    )}
                </button>

                <div className="border-t border-neutral-850 pt-4 flex gap-3 justify-center">
                    <button
                        className="premium-button-secondary flex-1 h-9 gap-1.5"
                        type="button"
                        onClick={() => onClickSocialLogin('github')}
                    >
                        <IconBrandGithub className="h-4 w-4" />
                        GitHub
                    </button>
                    <button
                        className="premium-button-secondary flex-1 h-9 gap-1.5"
                        type="button"
                        onClick={() => onClickSocialLogin('google')}
                    >
                        <IconBrandGoogle className="h-4 w-4" />
                        Google
                    </button>
                    <button
                        className="premium-button-secondary flex-1 h-9 gap-1.5"
                        type="button"
                        onClick={() => onClickSocialLogin('linkedin')}
                    >
                        <IconBrandLinkedin className="h-4 w-4" />
                        LinkedIn
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-[10px] text-neutral-500 leading-normal">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-indigo-400 hover:underline">
                    Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-indigo-400 hover:underline">
                    Privacy Policy
                </a>
            </div>

            <div className="mt-4 text-center text-xs text-neutral-400">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={() => router.replace('/login')}
                    className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                    Log In
                </button>
            </div>
        </div>
    )
}

export default SignupForm
