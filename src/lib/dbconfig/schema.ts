import {
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    boolean,
    doublePrecision,
} from 'drizzle-orm/pg-core'

export enum UserRole {
    ADMIN = 'ADMIN',
    DELIVERY_AGENT = 'DELIVERY_AGENT',
    CUSTOMER = 'CUSTOMER',
}

export const usersTable = pgTable('user', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    // NextAuth expects camelCase column names like `emailVerified`
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    password: text('password'),
    role: text('role').$type<UserRole>().default(UserRole.CUSTOMER),
    isTwoFactorEnabled: boolean('isTwoFactorEnabled').default(false),
    // Optional reference id to a two-factor confirmation record (not enforced as FK
    // to avoid circular constraints). Stores the id from `twoFactorConfirmation` table
    // when present so you can query both directions without requiring a DB-level FK.
    twoFactorConfirmationId: text('twoFactorConfirmationId'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
        () => new Date()
    ),
})

export type AdapterAccountType = 'oauth' | 'oidc' | 'email' | 'webauthn'

export const accountsTable = pgTable(
    'account',
    {
        userId: text('userId')
            .notNull()
            .references(() => usersTable.id, { onDelete: 'cascade' }),
        type: text('type').$type<AdapterAccountType>().notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('providerAccountId').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
)

export const verificationTokensTable = pgTable(
    'verificationToken',
    {
        id: text('id')
            .notNull()
            .$defaultFn(() => crypto.randomUUID()),
        token: text('token').notNull().unique(),
        email: text('email').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [
                    verificationToken.id,
                    verificationToken.token,
                    verificationToken.email,
                ],
            }),
        },
    ]
)

export const resetPasswordTokensTable = pgTable(
    'resetPasswordToken',
    {
        id: text('id')
            .notNull()
            .$defaultFn(() => crypto.randomUUID()),
        token: text('token').notNull().unique(),
        email: text('email').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (resetPasswordToken) => [
        {
            compositePk: primaryKey({
                columns: [resetPasswordToken.token, resetPasswordToken.email],
            }),
        },
    ]
)

export const twoFactorTokensTable = pgTable(
    'twoFactorTokens',
    {
        id: text('id')
            .notNull()
            .$defaultFn(() => crypto.randomUUID()),
        token: text('token').notNull().unique(),
        email: text('email').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (twoFactorTokens) => [
        {
            compositePk: primaryKey({
                columns: [
                    twoFactorTokens.id,
                    twoFactorTokens.token,
                    twoFactorTokens.email,
                ],
            }),
        },
    ]
)

export const twoFactorConfirmationTable = pgTable('twoFactorConfirmation', {
    id: text('id')
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
    userId: text('userId')
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' })
        .unique(),
})
export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect

export type InsertAccount = typeof accountsTable.$inferInsert
export type SelectAccount = typeof accountsTable.$inferSelect

export type InsertVerificationToken =
    typeof verificationTokensTable.$inferInsert
export type SelectVerificationToken =
    typeof verificationTokensTable.$inferSelect

export type InsertResetPasswordToken =
    typeof resetPasswordTokensTable.$inferInsert
export type SelectResetPasswordToken =
    typeof resetPasswordTokensTable.$inferSelect

export type InsertTwoFactorToken = typeof twoFactorTokensTable.$inferInsert
export type SelectTwoFactorToken = typeof twoFactorTokensTable.$inferSelect

export type InsertTwoFactorConfirmation =
    typeof twoFactorConfirmationTable.$inferInsert
export type SelectTwoFactorConfirmation =
    typeof twoFactorConfirmationTable.$inferSelect

export const zonesTable = pgTable('zone', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    pinCodes: text('pin_codes').notNull(), // JSON string array
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const deliveryAgentProfilesTable = pgTable('delivery_agent_profile', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' })
        .unique(),
    phone: text('phone').notNull(),
    assignedZoneId: text('assignedZoneId').references(() => zonesTable.id, {
        onDelete: 'set null',
    }),
    availability: boolean('availability').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const rateCardsTable = pgTable('rate_card', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    zoneId: text('zoneId')
        .notNull()
        .references(() => zonesTable.id, { onDelete: 'cascade' }),
    minWeight: doublePrecision('minWeight').notNull(),
    maxWeight: doublePrecision('maxWeight').notNull(),
    basePrice: doublePrecision('basePrice').notNull(),
    // B2B or B2C rate card
    orderType: text('orderType').$type<'B2B' | 'B2C'>().notNull().default('B2C'),
    // INTRA = same zone, INTER = cross-zone
    zoneType: text('zoneType').$type<'INTRA' | 'INTER'>().notNull().default('INTRA'),
    // Admin-configurable COD surcharge percentage (e.g. 1.5 = 1.5%)
    codSurcharge: doublePrecision('codSurcharge').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const ordersTable = pgTable('order', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    customerId: text('customerId')
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    pickupAddress: text('pickupAddress').notNull(),
    deliveryAddress: text('deliveryAddress').notNull(),
    deliveryPinCode: text('deliveryPinCode').notNull(),
    weight: doublePrecision('weight').notNull(),
    // Package dimensions (cm) — optional, used for volumetric weight
    length: doublePrecision('length'),
    width: doublePrecision('width'),
    height: doublePrecision('height'),
    // Volumetric weight = (L×W×H)/5000; stored for auditing
    volumetricWeight: doublePrecision('volumetricWeight'),
    // Billable weight = max(actualWeight, volumetricWeight)
    billableWeight: doublePrecision('billableWeight'),
    // B2B or B2C shipment
    orderType: text('orderType').$type<'B2B' | 'B2C'>().notNull().default('B2C'),
    // PREPAID or COD
    paymentType: text('paymentType').$type<'PREPAID' | 'COD'>().notNull().default('PREPAID'),
    // Absolute COD surcharge amount applied (for auditing)
    codSurchargeAmount: doublePrecision('codSurchargeAmount').notNull().default(0),
    // Pickup PIN code (used for intra/inter zone detection)
    pickupPinCode: text('pickupPinCode'),
    // Pickup zone FK (resolved from pickupPinCode)
    pickupZoneId: text('pickupZoneId').references(() => zonesTable.id, {
        onDelete: 'set null',
    }),
    zoneId: text('zoneId')
        .notNull()
        .references(() => zonesTable.id),
    rateCardId: text('rateCardId')
        .notNull()
        .references(() => rateCardsTable.id),
    agentId: text('agentId').references(() => deliveryAgentProfilesTable.id, {
        onDelete: 'set null',
    }),
    status: text('status').notNull(),
    price: doublePrecision('price').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
        () => new Date()
    ),
})

export const orderStatusHistoryTable = pgTable('order_status_history', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: text('orderId')
        .notNull()
        .references(() => ordersTable.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    changedById: text('changedById').references(() => usersTable.id, {
        onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const deliveryOtpsTable = pgTable('delivery_otp', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    orderId: text('orderId')
        .notNull()
        .references(() => ordersTable.id, { onDelete: 'cascade' }),
    otpHash: text('otpHash').notNull(),
    expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
    verified: boolean('verified').default(false).notNull(),
    verifiedAt: timestamp('verifiedAt', { mode: 'date' }),
    verifiedBy: text('verifiedBy').references(() => usersTable.id, {
        onDelete: 'set null',
    }),
    attemptCount: integer('attemptCount').default(0).notNull(),
    resentCount: integer('resentCount').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
        () => new Date()
    ),
    createdBy: text('createdBy').references(() => usersTable.id, {
        onDelete: 'set null',
    }),
})

export type InsertZone = typeof zonesTable.$inferInsert
export type SelectZone = typeof zonesTable.$inferSelect

export type InsertDeliveryAgentProfile =
    typeof deliveryAgentProfilesTable.$inferInsert
export type SelectDeliveryAgentProfile =
    typeof deliveryAgentProfilesTable.$inferSelect

export type InsertRateCard = typeof rateCardsTable.$inferInsert
export type SelectRateCard = typeof rateCardsTable.$inferSelect

export type InsertOrder = typeof ordersTable.$inferInsert
export type SelectOrder = typeof ordersTable.$inferSelect

export type InsertOrderStatusHistory =
    typeof orderStatusHistoryTable.$inferInsert
export type SelectOrderStatusHistory =
    typeof orderStatusHistoryTable.$inferSelect

export type InsertDeliveryOtp = typeof deliveryOtpsTable.$inferInsert
export type SelectDeliveryOtp = typeof deliveryOtpsTable.$inferSelect
