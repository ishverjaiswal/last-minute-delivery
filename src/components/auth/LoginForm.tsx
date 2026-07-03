/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
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
import { LoginFormSchema } from '@/lib/schema/authSchema'
import { DEMO_DATA } from '@/lib/demo-data'
import { FieldError } from '@/components/auth/ui/field'
import FormError from '@/components/auth/ui/form-error'
import FormSuccess from '@/components/auth/ui/form-success'
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/route'
import { useSearchParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'

interface LoginFormProps {
    title?: string
    subtitle?: string
    buttonLabel?: string
    buttonHref?: string
    isModal?: boolean
}

export function LoginForm({
    title,
    subtitle,
    buttonLabel,
    isModal = false,
}: LoginFormProps) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [showTwoFactor, setShowTwoFactor] = useState(false)
    const [loadingRole, setLoadingRole] = useState<string | null>(null)
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    const searchParams = useSearchParams()
    const urlError =
        searchParams.get('error') === 'OAuthAccountNotLinked'
            ? 'Your email is already in use. Please use another email'
            : ''
    const callbackUrl = searchParams.get('callbackUrl') || undefined

    type LoginValues = z.infer<typeof LoginFormSchema>

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginFormSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            twoFactorCode: '',
        },
    })

    const authenticate = async (values: LoginValues) => {
        setSuccess('')
        setError('')

        startTransition(async () => {
            try {
                const response = await axios.post(
                    '/api/auth/login',
                    {
                        email: values.email.trim(),
                        password: values.password,
                        twoFactorCode:
                            values.twoFactorCode?.trim() || undefined,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const message =
                    response.data?.message ?? 'Logged in successfully.'
                if (response.data.twoFactorRequired) {
                    setShowTwoFactor(true)
                    setSuccess(message)
                    setError('')
                    form.setValue('twoFactorCode', '')
                    form.setFocus('twoFactorCode')
                    return
                }
                setSuccess(message)
                setError('')
                setShowTwoFactor(false)

                const routeTo = callbackUrl || DEFAULT_LOGIN_REDIRECT
                window.location.href = routeTo
            } catch (err: any) {
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

    const onSubmit = (values: LoginValues) => {
        setLoadingRole(null)
        authenticate(values)
    }

    const handleDemoLogin = (email: string, roleName: string) => {
        if (isPending) return
        setLoadingRole(roleName)

        let targetEmail = email
        let targetPassword = 'password123'

        if (roleName === 'CUSTOMER') {
            targetEmail = DEMO_DATA.customerLogin.email
            targetPassword = DEMO_DATA.customerLogin.password
        } else if (roleName === 'ADMIN') {
            targetEmail = DEMO_DATA.adminLogin.email
            targetPassword = DEMO_DATA.adminLogin.password
        } else if (roleName === 'DELIVERY_AGENT') {
            targetEmail = DEMO_DATA.agentLogin.email
            targetPassword = DEMO_DATA.agentLogin.password
        }

        form.setValue('email', targetEmail, { shouldValidate: true })
        form.setValue('password', targetPassword, { shouldValidate: true })

        const demoValues: LoginValues = {
            email: targetEmail,
            password: targetPassword,
            twoFactorCode: '',
        }
        authenticate(demoValues)
    }

    const handleClose = () => {
        router.push('/')
    }

    const onClickSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT })
    }

    const submitLabel = buttonLabel ?? 'Log In'

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
                {showTwoFactor && (
                    <Controller
                        name="twoFactorCode"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div className="premium-form-group">
                                <Label
                                    htmlFor="twoFactorCode"
                                    className="premium-form-label"
                                >
                                    Two-Factor Code{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="twoFactorCode"
                                    placeholder="123456"
                                    type="text"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="one-time-code"
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
                )}
                {!showTwoFactor && (
                    <>
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
                                    <div className="flex justify-between items-center">
                                        <Label
                                            htmlFor="password"
                                            className="premium-form-label"
                                        >
                                            Password{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Link
                                            href="/reset-password"
                                            className="text-[10px] text-indigo-400 hover:underline font-bold"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="current-password"
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
                    </>
                )}

                <div className="my-2">
                    {error && <FormError message={error || urlError} />}
                    {success && <FormSuccess message={success} />}
                </div>

                {isDemoMode && (
                    <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-center space-y-2">
                        <p className="text-[10px] font-bold text-indigo-400 flex items-center justify-center gap-1 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> Demo Mode Active
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    handleDemoLogin(
                                        DEMO_DATA.customerLogin.email,
                                        'CUSTOMER'
                                    )
                                }
                                className="premium-button-secondary text-xs h-8 justify-center select-none"
                            >
                                {isPending && loadingRole === 'CUSTOMER' ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
                                        Customer...
                                    </span>
                                ) : (
                                    'Use Demo Customer'
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    handleDemoLogin(
                                        DEMO_DATA.adminLogin.email,
                                        'ADMIN'
                                    )
                                }
                                className="premium-button-secondary text-xs h-8 justify-center select-none"
                            >
                                {isPending && loadingRole === 'ADMIN' ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
                                        Admin...
                                    </span>
                                ) : (
                                    'Use Demo Admin'
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    handleDemoLogin(
                                        DEMO_DATA.agentLogin.email,
                                        'DELIVERY_AGENT'
                                    )
                                }
                                className="premium-button-secondary text-xs h-8 justify-center select-none"
                            >
                                {isPending &&
                                loadingRole === 'DELIVERY_AGENT' ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
                                        Driver...
                                    </span>
                                ) : (
                                    'Use Demo Delivery Agent'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    className="premium-button-primary w-full h-10 select-none"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending && !loadingRole ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent animate-spin rounded-full" />
                            Authenticating...
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

export default LoginForm
