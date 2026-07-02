'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { settingsSchema } from '@/lib/schema/authSchema'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { useRouter } from 'next/navigation'

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
                    ? (session.user.role as 'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN')
                    : 'CUSTOMER',
            isTwoFactorEnabled: session?.user?.twoFactorEnabled || false,
            password: '',
            newPassword: '',
        },
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const isTwoFactorEnabled = watch('isTwoFactorEnabled')
    const currentRole = watch('role')

    const onSubmit = async (data: SettingsFormData) => {
        setMessage(null)

        startTransition(async () => {
            try {
                const response = await axios.post('/api/settings', data)

                if (response.data.success) {
                    setMessage({ type: 'success', text: response.data.message })

                    // Update session to reflect changes
                    await update()

                    // Refresh router to get updated data
                    router.refresh()

                    // Reset password fields
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

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4 text-white">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
                    <p className="text-neutral-400 text-sm mt-1">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-xl text-sm text-center font-semibold ${
                            message.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                                : 'bg-red-500/10 text-red-500 border border-red-500/50'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">
                            Profile Information
                        </h2>

                        <div className="space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                disabled={isPending}
                                placeholder="Enter your name"
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                disabled={isPending || session?.user?.isOAuth}
                                placeholder="Enter your email"
                                className="bg-neutral-950 border-neutral-800 text-white text-sm"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                            {session?.user?.isOAuth && (
                                <p className="text-xs text-neutral-500">
                                    Email cannot be changed for OAuth accounts
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                {...register('role')}
                                disabled={isPending}
                                className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                            >
                                <option value="CUSTOMER">👤 Customer</option>
                                <option value="DELIVERY_AGENT">🛵 Delivery Agent</option>
                                <option value="ADMIN">👑 Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-xs text-red-500">
                                    {errors.role.message}
                                </p>
                            )}
                            <div className="flex items-center gap-2 pt-1.5">
                                <p className="text-xs text-neutral-400 font-medium">
                                    Current role:
                                </p>
                                <Badge
                                    className="bg-indigo-500/20 text-indigo-500 border border-indigo-500/50 px-2 py-0.5 rounded text-[10px] font-bold"
                                >
                                    {currentRole === 'ADMIN'
                                        ? '👑 Admin'
                                        : currentRole === 'DELIVERY_AGENT'
                                          ? '🛵 Delivery Agent'
                                          : '👤 Customer'}
                                </Badge>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-850">
                            <p className="text-xs text-neutral-400">
                                <strong className="font-bold text-neutral-200">Account Type:</strong>{' '}
                                {session?.user?.isOAuth
                                    ? 'OAuth'
                                    : 'Credentials'}
                            </p>
                        </div>
                    </div>

                    {/* Security Card */}
                    {!session?.user?.isOAuth && (
                        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">Security</h2>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">
                                    Current Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    disabled={isPending}
                                    placeholder="Enter current password"
                                    className="bg-neutral-950 border-neutral-800 text-white text-sm"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...register('newPassword')}
                                    disabled={isPending}
                                    placeholder="Enter new password"
                                    className="bg-neutral-950 border-neutral-800 text-white text-sm"
                                />
                                {errors.newPassword && (
                                    <p className="text-xs text-red-500">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                                <p className="text-xs text-neutral-500">
                                    Leave blank to keep current password
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Two Factor Authentication Card */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold border-b border-neutral-800 pb-2">
                            Two-Factor Authentication
                        </h2>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isTwoFactorEnabled"
                                {...register('isTwoFactorEnabled')}
                                disabled={isPending || session?.user?.isOAuth}
                                className="h-4 w-4 rounded bg-neutral-950 border-neutral-800"
                            />
                            <Label
                                htmlFor="isTwoFactorEnabled"
                                className="cursor-pointer select-none"
                            >
                                Enable Two-Factor Authentication
                            </Label>
                        </div>

                        <p className="text-xs text-neutral-400 font-semibold">
                            {isTwoFactorEnabled
                                ? '✅ Two-factor authentication is enabled for your account'
                                : '❌ Two-factor authentication is currently disabled'}
                        </p>

                        {session?.user?.isOAuth && (
                            <p className="text-xs text-neutral-500">
                                Two-factor authentication is not available for OAuth accounts
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-3 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                        {isPending ? 'Saving changes...' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
