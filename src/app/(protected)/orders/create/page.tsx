/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreateOrderPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Smart UX states
    const [zones, setZones] = useState<any[]>([])
    const [rateCards, setRateCards] = useState<any[]>([])
    const [pinCheck, setPinCheck] = useState<{
        status: 'idle' | 'checking' | 'available' | 'unavailable'
        zoneName?: string
        estimatedCost?: number
    }>({ status: 'idle' })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            senderName: '',
            senderPhone: '',
            pickupAddress: '',
            recipientName: '',
            recipientPhone: '',
            deliveryAddress: '',
            deliveryPinCode: '',
            weight: 1,
            category: 'Clothing',
            isFragile: false,
            specialInstructions: '',
        },
    })

    const watchedPin = watch('deliveryPinCode')
    const watchedWeight = watch('weight')

    // Fetch zones and rate cards on load
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const zonesRes = await axios.get('/api/zones')
                if (zonesRes.data.success) {
                    setZones(zonesRes.data.data)
                }
            } catch (err) {
                console.error('Failed to load serviceable zones:', err)
            }

            try {
                const ratesRes = await axios.get('/api/rate-cards')
                if (ratesRes.data.success) {
                    setRateCards(ratesRes.data.data)
                }
            } catch (err) {
                // Silently handle 403 for non-admin roles
            }
        }
        fetchRates()
    }, [])

    // Real-time PIN code and cost estimation checker
    useEffect(() => {
        if (!watchedPin || watchedPin.length < 5) {
            setPinCheck({ status: 'idle' })
            return
        }

        setPinCheck({ status: 'checking' })

        const matchedZone = zones.find((z) => {
            try {
                const pins = JSON.parse(z.pinCodes) as string[]
                return pins.includes(watchedPin)
            } catch {
                return false
            }
        })

        if (!matchedZone) {
            setPinCheck({ status: 'unavailable' })
            return
        }

        // Match rate card
        const rates = rateCards.filter((r) => r.zoneId === matchedZone.id)
        const matchedRate = rates.find((r) => watchedWeight >= r.minWeight && watchedWeight <= r.maxWeight)

        setPinCheck({
            status: 'available',
            zoneName: matchedZone.name,
            estimatedCost: matchedRate ? matchedRate.basePrice : undefined,
        })
    }, [watchedPin, watchedWeight, zones, rateCards])

    const onSubmit = async (values: any) => {
        setIsPending(true)
        setError(null)
        try {
            // Concatenate recipient/sender names nicely into address strings to store details
            const payload = {
                pickupAddress: `${values.senderName} (${values.senderPhone}) - ${values.pickupAddress}`,
                deliveryAddress: `${values.recipientName} (${values.recipientPhone}) - ${values.deliveryAddress}`,
                deliveryPinCode: values.deliveryPinCode,
                weight: values.weight,
            }

            const res = await axios.post('/api/orders', payload)
            if (res.data.success) {
                router.push(`/orders/${res.data.data.id}`)
            } else {
                setError(res.data.error?.message || 'Failed to place order')
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message || 'An error occurred')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="w-full max-w-6xl space-y-8 px-4 text-white">
            {/* Header Section */}
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Book a New Delivery</h1>
                <p className="text-neutral-400 text-sm">
                    Create a parcel shipment and receive an estimated delivery cost.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Inputs (Left side) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sender Card */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            1. Sender Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="senderName">
                                    Sender Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="senderName"
                                    type="text"
                                    {...register('senderName', { required: 'Sender name is required' })}
                                    placeholder="Your name"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.senderName && (
                                    <p className="text-xs text-red-500">{errors.senderName.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="senderPhone">
                                    Sender Phone <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="senderPhone"
                                    type="text"
                                    {...register('senderPhone', { required: 'Sender phone is required' })}
                                    placeholder="e.g. +91 9876543210"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.senderPhone && (
                                    <p className="text-xs text-red-500">{errors.senderPhone.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="pickupAddress">
                                    Pickup Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pickupAddress"
                                    type="text"
                                    {...register('pickupAddress', {
                                        required: 'Pickup address is required',
                                        minLength: { value: 5, message: 'Pickup address must be at least 5 characters' },
                                    })}
                                    placeholder="Enter full pickup address details"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.pickupAddress && (
                                    <p className="text-xs text-red-500">{errors.pickupAddress.message as string}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recipient Card */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            2. Recipient Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="recipientName">
                                    Recipient Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="recipientName"
                                    type="text"
                                    {...register('recipientName', { required: 'Recipient name is required' })}
                                    placeholder="Recipient name"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.recipientName && (
                                    <p className="text-xs text-red-500">{errors.recipientName.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipientPhone">
                                    Recipient Phone <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="recipientPhone"
                                    type="text"
                                    {...register('recipientPhone', { required: 'Recipient phone is required' })}
                                    placeholder="e.g. +91 9876543210"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.recipientPhone && (
                                    <p className="text-xs text-red-500">{errors.recipientPhone.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="deliveryAddress">
                                    Delivery Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="deliveryAddress"
                                    type="text"
                                    {...register('deliveryAddress', {
                                        required: 'Delivery address is required',
                                        minLength: { value: 5, message: 'Delivery address must be at least 5 characters' },
                                    })}
                                    placeholder="Enter full recipient address details"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.deliveryAddress && (
                                    <p className="text-xs text-red-500">{errors.deliveryAddress.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="deliveryPinCode">
                                    Delivery PIN Code (Serviceability Checking) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="deliveryPinCode"
                                    type="text"
                                    {...register('deliveryPinCode', {
                                        required: 'PIN code is required',
                                        pattern: { value: /^\d+$/, message: 'PIN code must contain only digits' },
                                    })}
                                    placeholder="e.g. 209305"
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800 font-mono tracking-wider"
                                />
                                {errors.deliveryPinCode && (
                                    <p className="text-xs text-red-500">{errors.deliveryPinCode.message as string}</p>
                                )}

                                {/* Serviceability Info Badge */}
                                {pinCheck.status === 'checking' && (
                                    <p className="text-xs text-neutral-400">Verifying logistics serviceability...</p>
                                )}
                                {pinCheck.status === 'available' && (
                                    <p className="text-xs text-green-500 font-semibold">
                                        ✓ Service Available in Zone: <span className="underline">{pinCheck.zoneName}</span>
                                    </p>
                                )}
                                {pinCheck.status === 'unavailable' && (
                                    <p className="text-xs text-red-500 font-semibold">
                                        ✕ Service Unavailable for PIN code {watchedPin}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Package Information Card */}
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            3. Package Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="weight">
                                    Package Weight (kg) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.1"
                                    {...register('weight', {
                                        valueAsNumber: true,
                                        required: 'Weight is required',
                                        min: { value: 0.1, message: 'Weight must be at least 0.1kg' },
                                    })}
                                    disabled={isPending}
                                    className="bg-neutral-950 border-neutral-800"
                                />
                                {errors.weight && (
                                    <p className="text-xs text-red-500">{errors.weight.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category">Package Category</Label>
                                <select
                                    id="category"
                                    {...register('category')}
                                    disabled={isPending}
                                    className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                >
                                    <option value="Documents">Documents</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Food">Food</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2 flex items-center gap-2 pt-2">
                                <input
                                    id="isFragile"
                                    type="checkbox"
                                    {...register('isFragile')}
                                    disabled={isPending}
                                    className="w-4 h-4 rounded bg-neutral-950 border border-neutral-800"
                                />
                                <Label htmlFor="isFragile" className="cursor-pointer select-none">
                                    This package contains fragile contents
                                </Label>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="specialInstructions">Special Instructions</Label>
                                <textarea
                                    id="specialInstructions"
                                    rows={3}
                                    {...register('specialInstructions')}
                                    placeholder="Enter any driver delivery instructions here..."
                                    disabled={isPending}
                                    className="w-full p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Summary Card (Right side) */}
                <div className="lg:col-span-1">
                    <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-6 lg:sticky lg:top-24">
                        <h2 className="text-lg font-bold tracking-tight border-b border-neutral-800 pb-2">
                            Delivery Summary
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-1 border-b border-neutral-850">
                                <span className="text-neutral-500 font-semibold">Selected Zone</span>
                                <span className="font-bold text-neutral-200">
                                    {pinCheck.status === 'available' ? pinCheck.zoneName : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-850">
                                <span className="text-neutral-500 font-semibold">Estimated Cost</span>
                                <span className="font-extrabold text-indigo-400 text-lg">
                                    {pinCheck.status === 'available' && pinCheck.estimatedCost !== undefined
                                        ? `$${pinCheck.estimatedCost.toFixed(2)}`
                                        : pinCheck.status === 'available'
                                        ? '$15.00'
                                        : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-850">
                                <span className="text-neutral-500 font-semibold">Delivery Status</span>
                                <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-bold">
                                    PENDING
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-neutral-500 font-semibold">Est. Delivery Time</span>
                                <span className="font-medium text-neutral-200">2-3 Business Days</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending || !isValid || pinCheck.status !== 'available'}
                            className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-3 rounded-lg text-sm shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Booking Shipment...' : 'Confirm Delivery Booking'}
                        </Button>
                        {pinCheck.status !== 'available' && watchedPin.length >= 5 && (
                            <p className="text-[10px] text-center text-red-500 font-semibold">
                                Booking disabled: Selected PIN code is not serviceable.
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
