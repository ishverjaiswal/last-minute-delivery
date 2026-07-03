export const DEMO_DATA = {
    customer: {
        name: 'Jane Smith',
        phone: '+91 9876543210',
        email: 'janesmith@example.com',
        pickupAddress: 'Flat 402, Block B, Silver Oak Apartments',
        recipientName: 'John Doe',
        recipientPhone: '+91 9123456789',
        deliveryAddress: 'Plot 12, Sector 15, Vasundhara',
        pin: '209305',
        weight: 2.5,
        packageCategory: 'Clothing',
        notes: 'Fragile. Handle with care. Please call before delivery.',
    },
    adminLogin: {
        email: 'admin@lastmile.com',
        password: 'password123',
    },
    customerLogin: {
        email: 'customer@lastmile.com',
        password: 'password123',
    },
    agentLogin: {
        email: 'agent@lastmile.com',
        password: 'password123',
    },
    zone: {
        name: 'West Delhi Zone',
        city: 'New Delhi',
        state: 'Delhi',
        pinCodes: '110018, 110027, 110058',
    },
    rateCard: {
        minWeight: 1.0,
        maxWeight: 20.0,
        basePrice: 8.5,
    },
    agent: {
        userId: 'e05705e8-5d2d-411a-8b8a-115f2066fa64',
        phone: '+91 9999988888',
    },
} as const
