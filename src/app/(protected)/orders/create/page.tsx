/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { DEMO_DATA } from '@/lib/demo-data'
import { Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'

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
        setValue,
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

    const fillSampleOrder = () => {
        setValue('senderName', DEMO_DATA.customer.name, { shouldValidate: true })
        setValue('senderPhone', DEMO_DATA.customer.phone, { shouldValidate: true })
        setValue('pickupAddress', DEMO_DATA.customer.pickupAddress, { shouldValidate: true })
        setValue('recipientName', DEMO_DATA.customer.recipientName, { shouldValidate: true })
        setValue('recipientPhone', DEMO_DATA.customer.recipientPhone, { shouldValidate: true })
        setValue('deliveryAddress', DEMO_DATA.customer.deliveryAddress, { shouldValidate: true })
        setValue('deliveryPinCode', DEMO_DATA.customer.pin, { shouldValidate: true })
        setValue('weight', DEMO_DATA.customer.weight, { shouldValidate: true })
        setValue('category', DEMO_DATA.customer.packageCategory, { shouldValidate: true })
        setValue('specialInstructions', DEMO_DATA.customer.notes, { shouldValidate: true })
        setValue('isFragile', true, { shouldValidate: true })
    }

    const onSubmit = async (values: any) => {
        setIsPending(true)
        setError(null)
        try {
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
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="premium-tyo-display">Book a New Delivery</h1>
                    <p className="premium-tyo-secondary">
                        Create a parcel shipment and receive an estimated delivery cost.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={fillSampleOrder}
                        className="premium-button-secondary text-xs h-9"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        Autofill Order Details
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 text-xs text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Inputs (Left side) (70%) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sender Card */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            1. Sender Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="premium-form-group">
                                <label htmlFor="senderName" className="premium-form-label">
                                    Sender Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="senderName"
                                    type="text"
                                    {...register('senderName', { required: 'Sender name is required' })}
                                    placeholder="Your name"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.senderName && (
                                    <p className="premium-form-error">{errors.senderName.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group">
                                <label htmlFor="senderPhone" className="premium-form-label">
                                    Sender Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="senderPhone"
                                    type="text"
                                    {...register('senderPhone', { required: 'Sender phone is required' })}
                                    placeholder="e.g. +91 9876543210"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.senderPhone && (
                                    <p className="premium-form-error">{errors.senderPhone.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group md:col-span-2">
                                <label htmlFor="pickupAddress" className="premium-form-label">
                                    Pickup Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="pickupAddress"
                                    type="text"
                                    {...register('pickupAddress', {
                                        required: 'Pickup address is required',
                                        minLength: { value: 5, message: 'Pickup address must be at least 5 characters' },
                                    })}
                                    placeholder="Enter full pickup address details"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.pickupAddress && (
                                    <p className="premium-form-error">{errors.pickupAddress.message as string}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recipient Card */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-card border-b border-neutral-855 pb-2">
                            2. Recipient Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="premium-form-group">
                                <label htmlFor="recipientName" className="premium-form-label">
                                    Recipient Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="recipientName"
                                    type="text"
                                    {...register('recipientName', { required: 'Recipient name is required' })}
                                    placeholder="Recipient name"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.recipientName && (
                                    <p className="premium-form-error">{errors.recipientName.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group">
                                <label htmlFor="recipientPhone" className="premium-form-label">
                                    Recipient Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="recipientPhone"
                                    type="text"
                                    {...register('recipientPhone', { required: 'Recipient phone is required' })}
                                    placeholder="e.g. +91 9876543210"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.recipientPhone && (
                                    <p className="premium-form-error">{errors.recipientPhone.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group md:col-span-2">
                                <label htmlFor="deliveryAddress" className="premium-form-label">
                                    Delivery Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="deliveryAddress"
                                    type="text"
                                    {...register('deliveryAddress', {
                                        required: 'Delivery address is required',
                                        minLength: { value: 5, message: 'Delivery address must be at least 5 characters' },
                                    })}
                                    placeholder="Enter full recipient address details"
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.deliveryAddress && (
                                    <p className="premium-form-error">{errors.deliveryAddress.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group md:col-span-2">
                                <label htmlFor="deliveryPinCode" className="premium-form-label">
                                    Delivery PIN Code (Kanpur Coverage Range) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="deliveryPinCode"
                                    type="text"
                                    {...register('deliveryPinCode', {
                                        required: 'PIN code is required',
                                        pattern: { value: /^\d+$/, message: 'PIN code must contain only digits' },
                                    })}
                                    placeholder="e.g. 209305"
                                    disabled={isPending}
                                    className="premium-input w-full font-mono tracking-wider"
                                />
                                {errors.deliveryPinCode && (
                                    <p className="premium-form-error">{errors.deliveryPinCode.message as string}</p>
                                )}

                                {/* PIN Check Status indicators */}
                                {pinCheck.status === 'checking' && (
                                    <p className="premium-form-helper">Checking coverage region...</p>
                                )}
                                {pinCheck.status === 'available' && (
                                    <p className="premium-form-helper text-green-500 font-semibold">
                                        ✓ Service Area Zone: <span className="underline">{pinCheck.zoneName}</span>
                                    </p>
                                )}
                                {pinCheck.status === 'unavailable' && (
                                    <p className="premium-form-helper text-red-500 font-semibold">
                                        ✕ PIN code {watchedPin} is outside coverage zone network
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Package Information Card */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            3. Package Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="premium-form-group">
                                <label htmlFor="weight" className="premium-form-label">
                                    Package Weight (kg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="weight"
                                    type="number"
                                    step="0.1"
                                    {...register('weight', {
                                        valueAsNumber: true,
                                        required: 'Weight is required',
                                        min: { value: 0.1, message: 'Weight must be at least 0.1kg' },
                                    })}
                                    disabled={isPending}
                                    className="premium-input w-full"
                                />
                                {errors.weight && (
                                    <p className="premium-form-error">{errors.weight.message as string}</p>
                                )}
                            </div>
                            <div className="premium-form-group">
                                <label htmlFor="category" className="premium-form-label">Package Category</label>
                                <select
                                    id="category"
                                    {...register('category')}
                                    disabled={isPending}
                                    className="premium-input w-full h-[2.25rem] bg-neutral-950 text-white"
                                >
                                    <option value="Documents">Documents</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Food">Food</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2 py-1">
                                <input
                                    id="isFragile"
                                    type="checkbox"
                                    {...register('isFragile')}
                                    disabled={isPending}
                                    className="w-4 h-4 accent-indigo-650 rounded bg-neutral-950 border border-neutral-800 cursor-pointer"
                                />
                                <label htmlFor="isFragile" className="text-xs font-semibold text-neutral-300 cursor-pointer select-none">
                                    This package contains fragile contents
                                </label>
                            </div>
                            <div className="premium-form-group md:col-span-2">
                                <label htmlFor="specialInstructions" className="premium-form-label">Special Instructions</label>
                                <textarea
                                    id="specialInstructions"
                                    rows={3}
                                    {...register('specialInstructions')}
                                    placeholder="Enter any driver delivery instructions here..."
                                    disabled={isPending}
                                    className="premium-input w-full h-auto p-3"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Summary Card (Right side) (30%) */}
                <div className="lg:col-span-1">
                    <div className="premium-card space-y-6 lg:sticky lg:top-24">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            Delivery Summary
                        </h2>

                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-neutral-850">
                                <span className="text-neutral-500 font-semibold">Assigned Region</span>
                                <span className="font-bold text-neutral-200">
                                    {pinCheck.status === 'available' ? pinCheck.zoneName : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-855">
                                <span className="text-neutral-500 font-semibold">Estimated Cost</span>
                                <span className="font-extrabold text-indigo-400 text-sm">
                                    {pinCheck.status === 'available' && pinCheck.estimatedCost !== undefined
                                        ? `$${pinCheck.estimatedCost.toFixed(2)}`
                                        : pinCheck.status === 'available'
                                        ? '$15.00'
                                        : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-850 items-center">
                                <span className="text-neutral-500 font-semibold">Initial Status</span>
                                <StatusBadge status="PENDING" />
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-neutral-500 font-semibold">Transit Duration</span>
                                <span className="font-medium text-neutral-200">2-3 Business Days</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !isValid || pinCheck.status !== 'available'}
                            className="premium-button-primary w-full h-10 select-none"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent animate-spin rounded-full" />
                                    Booking Shipment...
                                </span>
                            ) : 'Confirm Delivery Booking'}
                        </button>
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
