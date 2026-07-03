import { findAllZones } from '@/lib/queries/zones/select'
import { findRateCardsByZoneId } from '@/lib/queries/rate-cards/select'

export const billingService = {
    calculateOrderPrice: async (pinCode: string, weight: number) => {
        // Find zone that contains the pinCode
        const zones = await findAllZones()
        const matchedZone = zones.find((z) => {
            try {
                const pins = JSON.parse(z.pinCodes) as string[]
                return pins.includes(pinCode)
            } catch {
                return false
            }
        })

        if (!matchedZone) {
            throw new Error(`We do not service this PIN code: ${pinCode}`)
        }

        // Get rate cards for this zone
        const rateCards = await findRateCardsByZoneId(matchedZone.id)
        // Find a card where weight is between minWeight and maxWeight
        const matchedCard = rateCards.find(
            (c) => weight >= c.minWeight && weight <= c.maxWeight
        )

        if (!matchedCard) {
            throw new Error(
                `No rate card configured for weight ${weight} kg in zone ${matchedZone.name}`
            )
        }

        return {
            price: matchedCard.basePrice,
            zoneId: matchedZone.id,
            rateCardId: matchedCard.id,
        }
    },
}
