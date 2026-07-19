import { findAllZones } from '@/lib/queries/zones/select'
import { findRateCardsByZoneId } from '@/lib/queries/rate-cards/select'

export interface PriceBreakdown {
    /** Destination zone ID */
    zoneId: string
    /** Destination zone name */
    zoneName: string
    /** Pickup zone ID (if resolved) */
    pickupZoneId: string | null
    /** Whether the shipment is within the same zone */
    zoneType: 'INTRA' | 'INTER'
    /** Matched rate card ID */
    rateCardId: string
    /** Actual (physical) weight in kg */
    actualWeight: number
    /** Volumetric weight = (L×W×H) / 5000; 0 if dimensions not provided */
    volumetricWeight: number
    /** Billable weight = max(actualWeight, volumetricWeight) */
    billableWeight: number
    /** Base price from the matched rate card */
    appliedRate: number
    /** COD surcharge amount (0 for PREPAID orders) */
    surchargeAmount: number
    /** Total price = appliedRate + surchargeAmount */
    totalPrice: number
}

/**
 * Resolves a zone from a list given a PIN code.
 * Returns the first zone whose pinCodes JSON array contains the given PIN.
 */
function resolveZoneByPin(
    zones: Array<{ id: string; name: string; pinCodes: string }>,
    pinCode: string
): { id: string; name: string } | null {
    const match = zones.find((z) => {
        try {
            const pins = JSON.parse(z.pinCodes) as string[]
            return pins.includes(pinCode)
        } catch {
            return false
        }
    })
    return match ? { id: match.id, name: match.name } : null
}

export const billingService = {
    /**
     * Full rate engine:
     * 1. Resolves destination zone from deliveryPinCode.
     * 2. Optionally resolves pickup zone from pickupPinCode.
     * 3. Determines INTRA / INTER zone type.
     * 4. Computes volumetric weight and billable weight.
     * 5. Matches the correct rate card by zone + orderType + zoneType + weight band.
     * 6. Applies COD surcharge if paymentType === 'COD'.
     * 7. Returns a full pricing breakdown.
     */
    calculateOrderPrice: async (params: {
        deliveryPinCode: string
        pickupPinCode?: string
        weight: number
        length?: number
        width?: number
        height?: number
        orderType: 'B2B' | 'B2C'
        paymentType: 'PREPAID' | 'COD'
    }): Promise<PriceBreakdown> => {
        const {
            deliveryPinCode,
            pickupPinCode,
            weight,
            length,
            width,
            height,
            orderType,
            paymentType,
        } = params

        // ── 1. Resolve zones ───────────────────────────────────────────────────
        const zones = await findAllZones()

        const destZone = resolveZoneByPin(zones, deliveryPinCode)
        if (!destZone) {
            throw new Error(
                `We do not service this delivery PIN code: ${deliveryPinCode}`
            )
        }

        let pickupZoneId: string | null = null
        if (pickupPinCode) {
            const pZone = resolveZoneByPin(zones, pickupPinCode)
            if (!pZone) {
                throw new Error(
                    `We do not service this pickup PIN code: ${pickupPinCode}`
                )
            }
            pickupZoneId = pZone.id
        }

        // ── 2. Zone type ───────────────────────────────────────────────────────
        // If no pickup zone is provided we default to INTRA.
        const zoneType: 'INTRA' | 'INTER' =
            pickupZoneId !== null && pickupZoneId !== destZone.id
                ? 'INTER'
                : 'INTRA'

        // ── 3. Volumetric & billable weight ────────────────────────────────────
        let volumetricWeight = 0
        if (
            length !== undefined &&
            width !== undefined &&
            height !== undefined
        ) {
            volumetricWeight = (length * width * height) / 5000
        }
        const billableWeight = Math.max(weight, volumetricWeight)

        // ── 4. Rate card matching ──────────────────────────────────────────────
        const rateCards = await findRateCardsByZoneId(destZone.id)

        const matchedCard = rateCards.find(
            (c) =>
                c.orderType === orderType &&
                c.zoneType === zoneType &&
                billableWeight >= c.minWeight &&
                billableWeight <= c.maxWeight
        )

        if (!matchedCard) {
            throw new Error(
                `No rate card configured for ${orderType} ${zoneType} order ` +
                    `with billable weight ${billableWeight.toFixed(3)} kg ` +
                    `in zone "${destZone.name}". ` +
                    `Please ask your admin to create the appropriate rate card.`
            )
        }

        // ── 5. COD surcharge ───────────────────────────────────────────────────
        // codSurcharge on rate card is a percentage (e.g. 1.5 = 1.5%)
        const surchargeAmount =
            paymentType === 'COD'
                ? (matchedCard.basePrice * matchedCard.codSurcharge) / 100
                : 0

        const totalPrice = matchedCard.basePrice + surchargeAmount

        return {
            zoneId: destZone.id,
            zoneName: destZone.name,
            pickupZoneId,
            zoneType,
            rateCardId: matchedCard.id,
            actualWeight: weight,
            volumetricWeight,
            billableWeight,
            appliedRate: matchedCard.basePrice,
            surchargeAmount,
            totalPrice,
        }
    },
}
