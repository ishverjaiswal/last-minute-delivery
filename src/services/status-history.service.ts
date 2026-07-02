import { createStatusHistory } from '@/lib/queries/status-histories/insert'
import { findHistoryByOrderId } from '@/lib/queries/status-histories/select'

export const statusHistoryService = {
    logStatusChange: async (orderId: string, status: string, changedById: string | null) => {
        return createStatusHistory({
            orderId,
            status,
            changedById,
        })
    },

    getOrderHistory: async (orderId: string) => {
        return findHistoryByOrderId(orderId)
    },
}
