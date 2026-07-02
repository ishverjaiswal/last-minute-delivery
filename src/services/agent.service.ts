import { createAgentProfile } from '@/lib/queries/agents/insert'
import { findAllAgents, findAgentById, findAgentByUserId } from '@/lib/queries/agents/select'
import { updateAgentProfile } from '@/lib/queries/agents/update'
import { updateUserById } from '@/lib/queries/users/update'
import { UserRole } from '@/lib/dbconfig/schema'

export const agentService = {
    registerAgent: async (userId: string, phone: string, assignedZoneId?: string | null) => {
        // Double check if profile exists
        const existing = await findAgentByUserId(userId)
        if (existing) {
            throw new Error('This user already has a delivery agent profile')
        }

        // Update user role to DELIVERY_AGENT
        await updateUserById(userId, { role: UserRole.DELIVERY_AGENT })

        // Create the profile
        return createAgentProfile({
            userId,
            phone,
            assignedZoneId: assignedZoneId || null,
            availability: true,
        })
    },

    getAgentsList: async () => {
        return findAllAgents()
    },

    getAgentDetail: async (id: string) => {
        return findAgentById(id)
    },

    toggleAgentAvailability: async (id: string, availability: boolean) => {
        return updateAgentProfile(id, { availability })
    },

    updateAgentProfileZone: async (id: string, assignedZoneId: string | null) => {
        return updateAgentProfile(id, { assignedZoneId })
    },
}
