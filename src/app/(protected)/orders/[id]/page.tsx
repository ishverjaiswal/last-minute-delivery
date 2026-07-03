/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import axios from 'axios'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonDetails } from '@/components/ui/Skeleton'
import { Timeline } from '@/components/ui/Timeline'
import { ActivityTimeline } from '@/components/ui/ActivityTimeline'
import { PremiumDialog } from '@/components/ui/PremiumDialog'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { 
    Clock, 
    CheckCircle, 
    Bike, 
    Package, 
    MapPin, 
    DollarSign, 
    AlertTriangle, 
    HelpCircle, 
    ArrowLeft, 
    Map 
} from 'lucide-react'

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const user = useCurrentUser()
    const role = user?.role

    const [order, setOrder] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [agents, setAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Admin state inputs
    const [selectedAgent, setSelectedAgent] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    // Proof of Delivery state inputs
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''))
    const [isVerifying, setIsVerifying] = useState(false)
    const [demoOtp, setDemoOtp] = useState<string | null>(null)
    const [recipientEmail, setRecipientEmail] = useState<string | null>(null)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [loadingAction, setLoadingAction] = useState(false)

    const fetchOrderDetail = async () => {
        try {
            const [orderRes, historyRes] = await Promise.all([
                axios.get(`/api/orders/${params.id}`),
                axios.get(`/api/orders/${params.id}/history`),
            ])
            if (orderRes.data.success) {
                const orderData = orderRes.data.data
                setOrder(orderData)
                setSelectedStatus(orderData.status)
                setSelectedAgent(orderData.agentId || '')
            }
            if (historyRes.data.success) {
                setHistory(historyRes.data.data)
            }

            if (role === 'ADMIN') {
                const agentsRes = await axios.get('/api/agents')
                if (agentsRes.data.success) {
                    setAgents(agentsRes.data.data)
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (role && params.id) {
            fetchOrderDetail()
        }
    }, [role, params.id])

    const handleAssignAgent = async () => {
        try {
            const res = await axios.patch(`/api/orders/${params.id}`, {
                agentId: selectedAgent || null,
            })
            if (res.data.success) {
                alert('Courier assignment updated successfully!')
                fetchOrderDetail()
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to assign agent')
        }
    }

    const handleStatusTransition = async (statusOverride?: string) => {
        const targetStatus = statusOverride || selectedStatus
        try {
            const res = await axios.patch(`/api/orders/${params.id}`, {
                status: targetStatus,
            })
            if (res.data.success) {
                alert(`Order status transitioned to ${targetStatus}`)
                fetchOrderDetail()
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to update order status')
        }
    }

    const handleSendOtp = async () => {
        setLoadingAction(true)
        setVerificationError(null)
        try {
            const res = await axios.post(`/api/orders/${params.id}/pod/send`)
            if (res.data.success) {
                if (res.data.data.otp) {
                    setDemoOtp(res.data.data.otp)
                    setRecipientEmail(res.data.data.recipientEmail)
                }
                alert('Verification OTP code sent to customer successfully.')
                setIsVerifying(true)
                fetchOrderDetail()
            }
        } catch (err: any) {
            alert(err.response?.data?.error?.message || 'Failed to send OTP')
        } finally {
            setLoadingAction(false)
        }
    }

    const handleVerifyOtp = async () => {
        const otpCode = otpValues.join('')
        if (otpCode.length !== 6) {
            setVerificationError('Verification code must be exactly 6 digits.')
            return
        }

        setLoadingAction(true)
        setVerificationError(null)
        try {
            const res = await axios.post(`/api/orders/${params.id}/pod/verify`, {
                otp: otpCode,
            })
            if (res.data.success) {
                setShowSuccessModal(true)
                setIsVerifying(false)
                setOtpValues(Array(6).fill(''))
                setDemoOtp(null)
            }
        } catch (err: any) {
            setVerificationError(err.response?.data?.error?.message || 'Verification failed')
        } finally {
            setLoadingAction(false)
        }
    }

    const handleOtpChange = (value: string, index: number) => {
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otpValues]
        newOtp[index] = value
        setOtpValues(newOtp)

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`)
            if (nextInput) {
                nextInput.focus()
            }
        }
    }

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                const newOtp = [...otpValues]
                newOtp[index - 1] = ''
                setOtpValues(newOtp)
                const prevInput = document.getElementById(`otp-input-${index - 1}`)
                if (prevInput) {
                    prevInput.focus()
                }
            } else {
                const newOtp = [...otpValues]
                newOtp[index] = ''
                setOtpValues(newOtp)
            }
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').trim()
        if (/^\d{6}$/.test(text)) {
            const newOtp = text.split('')
            setOtpValues(newOtp)
            const lastInput = document.getElementById('otp-input-5')
            if (lastInput) lastInput.focus()
        }
    }

    const parseAddressDetails = (addressStr: string) => {
        if (!addressStr) return { name: 'N/A', phone: 'N/A', address: 'N/A' }
        const match = addressStr.match(/^(.*?)\s*\((.*?)\)\s*-\s*(.*)$/)
        if (match) {
            return { name: match[1], phone: match[2], address: match[3] }
        }
        return { name: 'Standard Custody', phone: 'Not Listed', address: addressStr }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'premium-badge-pending'
            case 'CONFIRMED':
                return 'premium-badge-confirmed'
            case 'ASSIGNED':
                return 'premium-badge-assigned'
            case 'PICKED_UP':
                return 'premium-badge-picked-up'
            case 'OUT_FOR_DELIVERY':
                return 'premium-badge-out-for-delivery'
            case 'DELIVERED':
                return 'premium-badge-delivered'
            case 'CANCELLED':
                return 'premium-badge-cancelled'
            default:
                return 'premium-badge'
        }
    }

    if (loading) {
        return (
            <div className="w-full max-w-6xl space-y-6 px-4">
                <SkeletonDetails />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="w-full max-w-lg mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-4 text-center text-white">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Order</h1>
                <p className="text-neutral-400">{error || 'Order record not found.'}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="premium-button-primary"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    const pickupInfo = parseAddressDetails(order.pickupAddress)
    const deliveryInfo = parseAddressDetails(order.deliveryAddress)

    const timelineStates = [
        { label: 'Order Created', key: 'PENDING' },
        { label: 'Confirmed', key: 'CONFIRMED' },
        { label: 'Assigned', key: 'ASSIGNED' },
        { label: 'Picked Up', key: 'PICKED_UP' },
        { label: 'Out For Delivery', key: 'OUT_FOR_DELIVERY' },
        { label: 'Delivered', key: 'DELIVERED' },
    ]

    const currentStatusIndex = timelineStates.findIndex((s) => s.key === order.status)
    const allStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

    const getTimelineTimestamp = (statusKey: string) => {
        const found = history.find((h) => h.status === statusKey)
        if (!found) return null
        return new Date(found.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const assignedAgentObj = agents.find((a) => a.id === order.agentId)

    return (
        <div className="w-full max-w-6xl space-y-6 px-4 text-white">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-neutral-900 pb-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="premium-tyo-caption">Shipment Details</span>
                        <h1 className="premium-tyo-page leading-none">
                            LMD-{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="premium-tyo-secondary">
                        Sender: <strong className="text-neutral-200">{pickupInfo.name}</strong> • Created:{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/orders')}
                        className="premium-button-secondary text-xs h-9"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back to Orders
                    </button>
                    <button
                        onClick={() => alert('Tracking map (Mocked).')}
                        className="premium-button-primary text-xs h-9"
                    >
                        Track Shipment
                    </button>
                </div>
            </div>

            {/* Desktop Layout 70/30 split */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                
                {/* Left Side Timeline & Details (70%) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Visual Status Timeline (Visually Dominates) */}
                    <div className="premium-card space-y-6">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            Delivery Journey Timeline
                        </h2>

                        <Timeline
                            steps={timelineStates.map((state) => ({
                                ...state,
                                timestamp: getTimelineTimestamp(state.key),
                            }))}
                            currentIndex={currentStatusIndex}
                            isComplete={order.status === 'DELIVERED'}
                        />
                    </div>

                    {/* Shipment Overview Cards (Address Route details) */}
                    <div className="premium-card space-y-6">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            Shipment Addresses
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Route Path */}
                            <div className="space-y-1">
                                <p className="premium-tyo-caption">Pickup Location</p>
                                <p className="text-sm font-bold text-neutral-200">{pickupInfo.name}</p>
                                <p className="text-xs text-neutral-400">{pickupInfo.phone}</p>
                                <p className="text-xs text-neutral-400 leading-relaxed">{pickupInfo.address}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="premium-tyo-caption">Recipient Location</p>
                                <p className="text-sm font-bold text-neutral-200">{deliveryInfo.name}</p>
                                <p className="text-xs text-neutral-400">{deliveryInfo.phone}</p>
                                <p className="text-xs text-neutral-400 leading-relaxed">{deliveryInfo.address}</p>
                                <p className="text-xs text-neutral-400 font-mono">Kanpur PIN: {order.deliveryPinCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Proof of Delivery OTP verification form */}
                    {((['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) || order.podOtp) && (
                        <div className="premium-card space-y-6">
                            <div className="border-b border-neutral-850 pb-2">
                                <h2 className="premium-tyo-card">Proof of Delivery (POD)</h2>
                                <p className="premium-tyo-secondary">
                                    Recipient OTP verification is required to complete delivery.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-3">
                                    <div className="flex justify-between py-1 border-b border-neutral-850">
                                        <span className="text-neutral-500 font-semibold">Verification</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                                            !order.podOtp ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            order.podOtp.verified ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            new Date(order.podOtp.expiresAt) < new Date() ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                            {!order.podOtp ? 'Waiting' :
                                             order.podOtp.verified ? 'Verified' :
                                             new Date(order.podOtp.expiresAt) < new Date() ? 'Expired' :
                                             'OTP Sent'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-neutral-850">
                                        <span className="text-neutral-500 font-semibold">Resend Limit</span>
                                        <span className="text-neutral-200 font-medium">
                                            {order.podOtp ? `${order.podOtp.resentCount} / 3 times` : '0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-1 border-b border-neutral-850">
                                        <span className="text-neutral-500 font-semibold">Attempts Rem.</span>
                                        <span className="text-neutral-200 font-medium">
                                            {order.podOtp ? Math.max(0, 5 - order.podOtp.attemptCount) : '5'}
                                        </span>
                                    </div>
                                    {order.podOtp && order.podOtp.verifiedAt && (
                                        <div className="flex justify-between py-1 border-b border-neutral-850">
                                            <span className="text-neutral-500 font-semibold">Verified Time</span>
                                            <span className="text-neutral-200 font-medium">
                                                {new Date(order.podOtp.verifiedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Demo Mode helper */}
                            {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && demoOtp && (
                                <div className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-xs space-y-2">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">🧪 DEMO MODE AUTO-VERIFICATION</p>
                                    <div className="flex justify-between items-center">
                                        <span>Recipient Verification Code:</span>
                                        <span className="font-extrabold text-white text-base tracking-widest">{demoOtp}</span>
                                    </div>
                                </div>
                            )}

                            {/* Verification Form logic */}
                            {role === 'DELIVERY_AGENT' && order.status === 'OUT_FOR_DELIVERY' && (
                                <div className="space-y-4 pt-4 border-t border-neutral-850">
                                    {!order.podOtp && (
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={loadingAction}
                                            className="premium-button-primary w-full h-10"
                                        >
                                            {loadingAction ? 'Sending OTP...' : 'Send Delivery OTP'}
                                        </button>
                                    )}

                                    {order.podOtp && !order.podOtp.verified && (
                                        <div className="space-y-4">
                                            {isVerifying ? (
                                                <div className="space-y-3">
                                                    <label className="premium-form-label block text-center">
                                                        Enter 6-Digit OTP:
                                                    </label>
                                                    <div className="flex gap-2 justify-center">
                                                        {otpValues.map((val, idx) => (
                                                            <input
                                                                key={idx}
                                                                id={`otp-input-${idx}`}
                                                                type="text"
                                                                maxLength={1}
                                                                value={val}
                                                                onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                                                onPaste={handleOtpPaste}
                                                                className="w-9 h-11 bg-neutral-950 border border-neutral-800 rounded-lg text-center font-bold text-base focus:outline-none focus:border-neutral-700 text-white font-mono"
                                                            />
                                                        ))}
                                                    </div>
                                                    
                                                    {verificationError && (
                                                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-2.5 text-xs text-center">
                                                            {verificationError}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={handleVerifyOtp}
                                                            disabled={loadingAction || otpValues.join('').length < 6}
                                                            className="premium-button-primary flex-1 h-9"
                                                        >
                                                            {loadingAction ? 'Verifying...' : 'Verify OTP'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsVerifying(false)
                                                                setOtpValues(Array(6).fill(''))
                                                                setVerificationError(null)
                                                            }}
                                                            className="premium-button-secondary h-9"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {new Date(order.podOtp.expiresAt) > new Date() && order.podOtp.attemptCount < 5 && (
                                                        <button
                                                            onClick={() => setIsVerifying(true)}
                                                            className="premium-button-primary flex-1 h-9 bg-indigo-650 text-white"
                                                        >
                                                            Verify OTP
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleSendOtp}
                                                        disabled={loadingAction}
                                                        className="premium-button-secondary flex-1 h-9"
                                                    >
                                                        {loadingAction ? 'Resending...' : 'Resend OTP Code'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Completed verification state */}
                            {order.podOtp && order.podOtp.verified && (
                                <div className="text-center py-2 text-green-500 font-bold text-xs flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    ✓ Delivery Successfully Verified
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Log */}
                    <div className="premium-card space-y-6">
                        <h2 className="premium-tyo-card border-b border-neutral-850 pb-2">
                            Shipment Tracking Updates
                        </h2>

                        <ActivityTimeline
                            items={history
                                .slice()
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((step) => ({
                                    id: step.id,
                                    status: step.status,
                                    timestamp: new Date(step.createdAt).toLocaleString(),
                                    actor: step.changedByName,
                                }))}
                            emptyMessage="No shipment tracking updates recorded."
                        />
                    </div>
                </div>

                {/* Right Side Allocation, package params & support actions (30%) */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Status & pricing details card */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-caption">Shipment Specifications</h2>
                        <div className="space-y-3 text-xs text-neutral-400">
                            <div className="flex justify-between py-1 border-b border-neutral-850">
                                <span>Weight</span>
                                <span className="font-bold text-neutral-200">{order.weight} kg</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-850">
                                <span>Price Paid</span>
                                <span className="font-extrabold text-indigo-400">${order.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Estimated Transit</span>
                                <span className="font-bold text-neutral-200">2-3 Business Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Driver Agent details */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-caption">Assigned Delivery Agent</h2>
                        {order.agentId ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center">
                                        <Bike className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-neutral-200">
                                            {assignedAgentObj?.name || 'Assigned Courier'}
                                        </p>
                                        <p className="text-[10px] text-neutral-500 font-mono">
                                            {assignedAgentObj?.phone || '+91 98765 43210'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-500 italic py-2 text-center">Unassigned</p>
                        )}
                    </div>

                    {/* Action forms for Dispatcher or Courier */}
                    <div className="premium-card space-y-4">
                        <h2 className="premium-tyo-caption">Operations Console</h2>

                        {/* Customer Cancel action */}
                        {role === 'CUSTOMER' && (
                            <div className="space-y-3">
                                {order.status === 'PENDING' ? (
                                    <button
                                        onClick={() => handleStatusTransition('CANCELLED')}
                                        className="premium-button-primary w-full bg-red-600 hover:bg-red-700 text-white h-9"
                                    >
                                        Cancel Shipment Booking
                                    </button>
                                ) : (
                                    <p className="text-xs text-neutral-500 text-center py-2">
                                        Shipment locked. Cancellations disabled.
                                    </p>
                                )}
                                <button
                                    onClick={() => alert('Support desk ticket created!')}
                                    className="premium-button-secondary w-full h-9"
                                >
                                    Contact Support
                                </button>
                            </div>
                        )}

                        {/* Driver status updates */}
                        {role === 'DELIVERY_AGENT' && (
                            <div className="space-y-3">
                                {order.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => handleStatusTransition('PICKED_UP')}
                                        className="premium-button-primary w-full h-9 bg-indigo-600 text-white"
                                    >
                                        Mark Picked Up
                                    </button>
                                )}
                                {order.status === 'PICKED_UP' && (
                                    <button
                                        onClick={() => handleStatusTransition('OUT_FOR_DELIVERY')}
                                        className="premium-button-primary w-full h-9 bg-orange-600 text-white"
                                    >
                                        Mark Out For Delivery
                                    </button>
                                )}
                                {order.status === 'OUT_FOR_DELIVERY' && (
                                    <p className="text-xs text-neutral-500 text-center py-2">
                                        Please perform Proof of Delivery verification to complete delivery.
                                    </p>
                                )}
                                {['DELIVERED', 'CANCELLED'].includes(order.status) && (
                                    <p className="text-xs text-neutral-500 text-center py-2 text-neutral-500 italic">
                                        No active driver transitions available.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Dispatcher controls */}
                        {role === 'ADMIN' && (
                            <div className="space-y-4">
                                <div className="premium-form-group">
                                    <label htmlFor="agentAssign" className="premium-form-label">
                                        Assign Agent
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="agentAssign"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                            className="premium-input flex-1 h-9 bg-neutral-950"
                                        >
                                            <option value="">Unassigned</option>
                                            {agents.map((agent) => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.name || 'Agent'} ({agent.phone})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssignAgent}
                                            className="premium-button-primary h-9 px-3"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <div className="premium-form-group border-t border-neutral-850 pt-3">
                                    <label htmlFor="statusOverride" className="premium-form-label">
                                        Status Override
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="statusOverride"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="premium-input flex-1 h-9 bg-neutral-955"
                                        >
                                            {allStatuses.map((st) => (
                                                <option key={st} value={st}>
                                                    {st}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleStatusTransition()}
                                            className="premium-button-primary h-9 px-3"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PremiumDialog
                open={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false)
                    fetchOrderDetail()
                }}
                title="Proof of Delivery"
                footer={
                    <PremiumButton
                        variant="primary"
                        className="h-9 w-full"
                        onClick={() => {
                            setShowSuccessModal(false)
                            fetchOrderDetail()
                        }}
                    >
                        Continue
                    </PremiumButton>
                }
            >
                <div className="space-y-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-green-500/50 bg-green-500/20 text-green-500">
                        <CheckCircle className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="premium-typo-secondary">
                        Recipient verification succeeded. Order status changed to DELIVERED.
                    </p>
                </div>
            </PremiumDialog>
        </div>
    )
}
