'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { settingsSchema } from '@/lib/schema/authSchema'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { User, ShieldAlert, KeyRound } from 'lucide-react'
import { FormAlert } from '@/components/ui/FormAlert'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { PageHeader } from '@/components/ui/PageHeader'

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            role:
                session?.user?.role === 'CUSTOMER' ||
                session?.user?.role === 'DELIVERY_AGENT' ||
                session?.user?.role === 'ADMIN'
                    ? (session.user.role as
                          'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN')
                    : 'CUSTOMER',
            isTwoFactorEnabled: session?.user?.twoFactorEnabled || false,
            password: '',
            newPassword: '',
        },
    })

    const isTwoFactorEnabled = watch('isTwoFactorEnabled')
    const currentRole = watch('role')

    const onSubmit = async (data: SettingsFormData) => {
        setMessage(null)

        startTransition(async () => {
            try {
                const response = await axios.post('/api/settings', data)

                if (response.data.success) {
                    setMessage({ type: 'success', text: response.data.message })

                    await update()
                    router.refresh()

                    reset({
                        ...data,
                        password: '',
                        newPassword: '',
                    })
                } else {
                    setMessage({
                        type: 'error',
                        text:
                            response.data.error || 'Failed to update settings',
                    })
                }
            } catch (err: unknown) {
                let errorMessage = 'Something went wrong'

                if (axios.isAxiosError(err)) {
                    const responseError = err.response?.data?.error
                    if (typeof responseError === 'string') {
                        errorMessage = responseError
                    }
                }

                setMessage({ type: 'error', text: errorMessage })
            }
        })
    }

    const getRoleBadge = (roleStr?: string) => {
        switch (roleStr) {
            case 'ADMIN':
                return 'premium-badge-confirmed'
            case 'DELIVERY_AGENT':
                return 'premium-badge-assigned'
            default:
                return 'premium-badge-pending'
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4 text-white">
            <PageHeader
                title="Settings"
                description="Manage your logistics profile options, security preferences, and roles."
            />

            {message && (
                <FormAlert variant={message.type} message={message.text} />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. Profile Information section */}
                <div className="premium-card space-y-4">
                    <div className="flex items-center space-x-2 border-b border-neutral-850 pb-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <h2 className="premium-tyo-card">
                            Profile Information
                        </h2>
                    </div>

                    <div className="premium-form-group">
                        <label htmlFor="name" className="premium-form-label">
                            Full Name
                        </label>
                        <input
                            id="name"
                            {...register('name')}
                            disabled={isPending}
                            placeholder="Enter your name"
                            className="premium-input w-full"
                        />
                        {errors.name && (
                            <p className="premium-form-error">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="premium-form-group">
                        <label htmlFor="email" className="premium-form-label">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            disabled={isPending || session?.user?.isOAuth}
                            placeholder="Enter your email"
                            className="premium-input w-full"
                        />
                        {errors.email && (
                            <p className="premium-form-error">
                                {errors.email.message}
                            </p>
                        )}
                        {session?.user?.isOAuth && (
                            <p className="premium-form-helper">
                                Email updates are locked for OAuth accounts.
                            </p>
                        )}
                    </div>

                    <div className="premium-form-group">
                        <label htmlFor="role" className="premium-form-label">
                            User Access Role
                        </label>
                        <select
                            id="role"
                            {...register('role')}
                            disabled={isPending}
                            className="premium-input w-full h-[2.25rem] bg-neutral-955 text-white font-bold"
                        >
                            <option value="CUSTOMER">Customer Profile</option>
                            <option value="DELIVERY_AGENT">
                                Delivery Driver
                            </option>
                            <option value="ADMIN">Operations Admin</option>
                        </select>
                        {errors.role && (
                            <p className="premium-form-error">
                                {errors.role.message}
                            </p>
                        )}
                        <div className="flex items-center gap-2 pt-1.5">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                Active Role Indicator:
                            </span>
                            <span
                                className={`premium-badge ${getRoleBadge(currentRole)}`}
                            >
                                {currentRole}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Security (Password Update) section */}
                {!session?.user?.isOAuth && (
                    <div className="premium-card space-y-4">
                        <div className="flex items-center space-x-2 border-b border-neutral-850 pb-2">
                            <KeyRound className="w-4 h-4 text-neutral-400" />
                            <h2 className="premium-tyo-card">
                                Security Credentials
                            </h2>
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="password"
                                className="premium-form-label"
                            >
                                Current Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password')}
                                disabled={isPending}
                                placeholder="Enter current password to verify identity"
                                className="premium-input w-full"
                            />
                            {errors.password && (
                                <p className="premium-form-error">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="premium-form-group">
                            <label
                                htmlFor="newPassword"
                                className="premium-form-label"
                            >
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                {...register('newPassword')}
                                disabled={isPending}
                                placeholder="Enter new replacement password"
                                className="premium-input w-full"
                            />
                            {errors.newPassword && (
                                <p className="premium-form-error">
                                    {errors.newPassword.message}
                                </p>
                            )}
                            <p className="premium-form-helper">
                                Leave blank to keep current system password.
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. Preferences (Two-Factor Auth) section */}
                <div className="premium-card space-y-4">
                    <div className="flex items-center space-x-2 border-b border-neutral-850 pb-2">
                        <ShieldAlert className="w-4 h-4 text-neutral-400" />
                        <h2 className="premium-tyo-card">
                            Authentication Preferences
                        </h2>
                    </div>

                    <div className="flex items-center space-x-2 py-1">
                        <input
                            type="checkbox"
                            id="isTwoFactorEnabled"
                            {...register('isTwoFactorEnabled')}
                            disabled={isPending || session?.user?.isOAuth}
                            className="w-4 h-4 accent-indigo-650 rounded bg-neutral-950 border-neutral-800 cursor-pointer"
                        />
                        <label
                            htmlFor="isTwoFactorEnabled"
                            className="text-xs font-semibold text-neutral-300 cursor-pointer select-none"
                        >
                            Enable Security Two-Factor Authentication
                        </label>
                    </div>

                    <p
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                            isTwoFactorEnabled
                                ? 'text-green-500'
                                : 'text-red-500'
                        }`}
                    >
                        {isTwoFactorEnabled
                            ? '✓ Two-factor security active'
                            : '✕ Two-factor security inactive'}
                    </p>

                    {session?.user?.isOAuth && (
                        <p className="premium-form-helper">
                            Two-factor configurations are managed by your OAuth
                            SSO provider.
                        </p>
                    )}
                </div>

                {/* Submit Action */}
                <PremiumButton
                    type="submit"
                    variant="primary"
                    loading={isPending}
                    loadingText="Saving Settings…"
                    className="h-10 w-full"
                >
                    Save Settings Preferences
                </PremiumButton>
            </form>
        </div>
    )
}
