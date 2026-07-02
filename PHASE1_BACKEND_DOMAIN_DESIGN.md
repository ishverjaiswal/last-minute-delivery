# PHASE 1: Backend Domain Design & Contract Freeze

## 1. Final Domain Model
The backend domain for the Last Mile Delivery Tracker extends the existing NextAuth user database schema to handle order status history, delivery dispatching, delivery zones, rate models, and order statuses. It consists of the following domains:
* **User (Existing)**: The core account structure. Authentication and identity are managed here. The role model is frozen to exactly:
  * `ADMIN`: Handles configuration, rate cards, zone registrations, and driver assignments.
  * `DELIVERY_AGENT`: Delivery personnel responsible for picking up and delivering packages.
  * `CUSTOMER`: Authenticated system client who places and pays for orders.
* **DeliveryAgentProfile**: Specialized profile information associated with a `User` acting as a delivery driver. Contains only agent-specific properties (vehicle type, license status, active toggle).
* **Order**: Core entity representing a delivery request, including sender/receiver locations (postcodes), weight, dimensions, status, agent assignment, and associated pricing.
* **Zone**: Service region definitions representing coverage via postal PIN codes.
* **RateCard**: Pricing models used to calculate delivery charges within or across covered zones.
* **OrderStatusHistory**: An immutable ledger capturing order status transitions and event times.

---

## 2. Entity Responsibilities

### User (Existing)
* **Purpose**: Represents registered credentials, authentication profiles, and access authorization.
* **Responsibility**: Security resolution, session mapping, and holding the principal identity.
* **Relationships**:
  * If the user role is `DELIVERY_AGENT`, it has a 1-to-1 relationship with `DeliveryAgentProfile` (User `1 ---- 0..1` DeliveryAgentProfile).
  * If the user role is `CUSTOMER`, it has a 1-to-many relationship with `Order` (User `1 ---- *` Orders).
* **Lifecycle**: Created at signup/registration; persists long-term; deleted only upon account deletion.
* **Ownership**: Owned by the authentication and authorization layer.

### DeliveryAgentProfile
* **Purpose**: Houses configuration parameters unique to couriers.
* **Responsibility**: Storing license details, vehicle classifications, and active availability flags. Does NOT store credentials or base profile fields (name, email), which remain in the `User` entity.
* **Relationships**:
  * Belongs to one `User` with the `DELIVERY_AGENT` role (FK: `userId` to `user.id`).
  * Has many assigned `Orders`.
* **Lifecycle**: Created when a User is assigned the `DELIVERY_AGENT` role; deleted if the driver profile is revoked.
* **Ownership**: Owned by the operations management subsystem.

### Order
* **Purpose**: Manages package metadata and shipping states.
* **Responsibility**: Tracking sender/receiver information, weight, current status, agent assignment, zone assignment, and billing rates.
* **Relationships**:
  * Belongs to a sender `User` (role `CUSTOMER`) (FK: `senderId` to `user.id`).
  * Belongs to an assigned courier (`DeliveryAgentProfile`) (FK: `agentId` to `delivery_agent_profile.id`, nullable).
  * Belongs to a destination `Zone` (FK: `zoneId` to `zone.id`, nullable).
  * Belongs to a `RateCard` (FK: `rateCardId` to `rate_card.id`).
  * Has many `OrderStatusHistory` records.
* **Lifecycle**: Follows the frozen status list:
  `PENDING` → `CONFIRMED` → `ASSIGNED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `CANCELLED`).
* **Ownership**: Owned by the Customer (as creator) and Admin (for dispatch and assignments).

### Zone
* **Purpose**: Defines coverage areas.
* **Responsibility**: Listing covered PIN codes (postcodes) to determine serviceability. No GIS polygons or geospatial index logic is implemented.
* **Relationships**:
  * Has many `Orders` routed through its postcodes.
  * Has many associated `RateCards`.
* **Lifecycle**: Set up by Admins; persists as long as operations cover the area.
* **Ownership**: Owned by the operations subsystem.

### RateCard
* **Purpose**: Manages order cost calculations.
* **Responsibility**: Storing base rates, weight surcharge rates, and per-km parameters.
* **Relationships**:
  * Belongs to a `Zone` (FK: `zoneId` to `zone.id`).
  * Has many `Orders` charged under its rates.
* **Lifecycle**: Configured by Admins; updated or replaced as billing rules change.
* **Ownership**: Owned by the finance subsystem.

### OrderStatusHistory
* **Purpose**: Immutable status transition audit log.
* **Responsibility**: Storing status transitions, timestamp events, and the user ID initiating the change. Does NOT track GPS coordinates or location history.
* **Relationships**:
  * Belongs to one `Order` (FK: `orderId` to `order.id`).
* **Lifecycle**: Automatically appended whenever an order changes status; read-only; never deleted.
* **Ownership**: Owned by the system audit and verification subsystems.

---

## 3. Relationships

```
User (CUSTOMER)
  1  |-----* Order (placed by Customer)

User (DELIVERY_AGENT)
  1  |-----o| (0 or 1) DeliveryAgentProfile

DeliveryAgentProfile
  1  |-----* Order (assigned to Agent)

Zone (Serviceable PIN Codes)
  1  |-----* RateCard
  1  |-----* Order (Destination Zone)

RateCard
  1  |-----* Order (Pricing Rule applied)

Order
  1  |-----* OrderStatusHistory (Status Transition Log)
```

---

## 4. Repository Contracts

### UserRepository (Existing Queries)
* **Responsibility**: Manages standard user profile queries, roles, and NextAuth credentials verification.

### DeliveryAgentRepository
* **Responsibility**: Fetches and updates agent profile fields, license data, vehicle metrics, and availability switches.

### OrderRepository
* **Responsibility**: Inserts delivery orders, lists orders filtered by role, status, or date, and updates agent assignments and package states.

### ZoneRepository
* **Responsibility**: Creates zones and queries serviceable PIN codes.

### RateCardRepository
* **Responsibility**: Manages retrieval and configuration of zone-specific pricing models.

### StatusHistoryRepository
* **Responsibility**: Appends status logs and queries historical transitions for audit trails.

---

## 5. Service Contracts

### OrderService
* **Responsibility**: Implements order workflows. Handles order placement, price calculation, status transitions, and courier allocations. 
* **Workflow / Lifecycle Rules**: Pushes order through:
  `Customer Creates Order` → `Admin Reviews/Confirms` → `Admin Assigns Agent` → `Agent Picks Up` → `Agent Out For Delivery` → `Agent Marks Delivered`.

### AgentService
* **Responsibility**: Manages driver configurations and registers active profiles.

### BillingService
* **Responsibility**: Selects active `RateCard` properties for destination PIN codes and computes order costs.

### StatusHistoryService
* **Responsibility**: Logs transitions automatically on state changes and builds historic audit tracks.

---

## 6. API Contracts

### `GET /api/orders`
* **Purpose**: Lists orders. Admins see all; customers see their own placed orders; agents see their assigned delivery tasks.
* **Authentication Required**: Yes.
* **Role Required**: `CUSTOMER`, `DELIVERY_AGENT`, or `ADMIN`.
* **Expected Request**: Query params: `status`, `page`, `limit`.
* **Expected Response**: `{ "success": true, "data": [{ "id": "...", "status": "PENDING" }] }`

### `POST /api/orders`
* **Purpose**: Creates a new order.
* **Authentication Required**: Yes.
* **Role Required**: `CUSTOMER` or `ADMIN`.
* **Expected Request**: `{ "recipientName": "...", "recipientPhone": "...", "deliveryAddress": "...", "deliveryPinCode": "110001", "weight": 2.5, "zoneId": "..." }`
* **Expected Response**: `{ "success": true, "data": { "id": "...", "price": 12.00, "status": "PENDING" } }`

### `GET /api/orders/:id`
* **Purpose**: Fetches a single order.
* **Authentication Required**: Yes.
* **Role Required**: `CUSTOMER`, `DELIVERY_AGENT`, or `ADMIN`.
* **Expected Request**: URL parameter `id`.
* **Expected Response**: `{ "success": true, "data": { "id": "...", "status": "PENDING", "price": 12.00 } }`

### `PATCH /api/orders/:id`
* **Purpose**: Updates order status or agent assignments.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN` (for status/assignments) or `DELIVERY_AGENT` (only for updating status of their assigned orders).
* **Expected Request**: `{ "status": "ASSIGNED", "agentId": "..." }`
* **Expected Response**: `{ "success": true, "data": { "id": "...", "status": "ASSIGNED" } }`

### `GET /api/agents`
* **Purpose**: Lists delivery agents.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN`.
* **Expected Request**: Query params: `status` (Active/Inactive).
* **Expected Response**: `{ "success": true, "data": [{ "id": "...", "userId": "...", "vehicle": "..." }] }`

### `POST /api/agents`
* **Purpose**: Creates a delivery agent profile.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN`.
* **Expected Request**: `{ "userId": "...", "vehicle": "...", "licenseNumber": "..." }`
* **Expected Response**: `{ "success": true, "data": { "id": "...", "userId": "..." } }`

### `GET /api/zones`
* **Purpose**: Lists service zones.
* **Authentication Required**: Yes.
* **Role Required**: `CUSTOMER`, `DELIVERY_AGENT`, or `ADMIN`.
* **Expected Request**: None.
* **Expected Response**: `{ "success": true, "data": [{ "id": "...", "name": "...", "pinCodes": ["110001", "110002"] }] }`

### `POST /api/zones`
* **Purpose**: Registers a new zone and its serviceable PIN codes.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN`.
* **Expected Request**: `{ "name": "North Zone", "pinCodes": ["110001", "110002"] }`
* **Expected Response**: `{ "success": true, "data": { "id": "...", "name": "North Zone" } }`

### `GET /api/rate-cards`
* **Purpose**: Lists rate cards.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN`.
* **Expected Request**: None.
* **Expected Response**: `{ "success": true, "data": [{ "id": "...", "zoneId": "...", "basePrice": 5.00 }] }`

### `POST /api/rate-cards`
* **Purpose**: Creates pricing rules for a zone.
* **Authentication Required**: Yes.
* **Role Required**: `ADMIN`.
* **Expected Request**: `{ "zoneId": "...", "basePrice": 5.00, "perKgPrice": 2.00 }`
* **Expected Response**: `{ "success": true, "data": { "id": "...", "basePrice": 5.00 } }`

### `GET /api/orders/:id/history`
* **Purpose**: Retrieves status history of an order.
* **Authentication Required**: Yes.
* **Role Required**: `CUSTOMER`, `DELIVERY_AGENT`, or `ADMIN`.
* **Expected Request**: URL parameter `id`.
* **Expected Response**: `{ "success": true, "data": [{ "status": "PENDING", "updatedAt": "..." }, { "status": "CONFIRMED", "updatedAt": "..." }] }`

---

## 7. Validation Contracts

### User Profile
* **Required**: Name, Email (validated format), Role (validated enum `CUSTOMER`, `DELIVERY_AGENT`, `ADMIN`).

### DeliveryAgentProfile
* **Required**: `userId` reference, license verification string.
* **Optional**: vehicle metadata (type, plate number).
* **Business Rules**: Unique profile per user with the `DELIVERY_AGENT` role.

### Order
* **Required**: `senderId` reference, recipient contact details, destination `deliveryPinCode`, package weight/dimensions, `rateCardId`.
* **Optional**: `agentId` (assigned courier).
* **Business Rules**: Weight and dimensions must be positive values. Price must be calculated using a valid active `RateCard`. Destination `deliveryPinCode` must exist within a configured `Zone` postcode list.
* **Statuses Allowed**: Exactly `PENDING`, `CONFIRMED`, `ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

### Zone
* **Required**: Unique Zone Name, array of serviceable PIN codes (`string[]`).
* **Business Rules**: PIN codes must be formatted (alphanumeric/numbers) and must not overlap between active zones. No GIS polygon structures.

### RateCard
* **Required**: Associated `zoneId`, Base pricing, per-kg surcharges.
* **Business Rules**: Only one active rate card per zone.

### OrderStatusHistory
* **Required**: `orderId`, new status (must be valid order status transition), transition timestamp.

---

## 8. Error Contracts

API endpoints return standardized JSON envelopes matching the following specifications:

### Success Response
```json
{
  "success": true,
  "data": {
    "key": "value"
  }
}
```

### Validation Failure (Status Code: 400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input fields failed schema validation rules.",
    "details": {
      "fieldName": ["Validation error message details"]
    }
  }
}
```

### Authentication Failure (Status Code: 401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "A valid user session is required to access this endpoint."
  }
}
```

### Authorization Failure (Status Code: 403)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Your user account does not possess the permissions required to execute this action."
  }
}
```

### Business Rule Violation (Status Code: 422)
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "The request violates business workflow constraints (e.g. Courier is already assigned or order is completed)."
  }
}
```

### Internal Server Error (Status Code: 500)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred on the server."
  }
}
```

---

## 9. Implementation Roadmap

### Phase 2: Database Schema
* **Objective**: Define database tables, indexes, and primary/foreign keys in Drizzle ORM matching the frozen schema design. Execute migration setups.

### Phase 3: Repository Layer
* **Objective**: Implement clean repository query helper files under `src/lib/queries/` executing isolated select, insert, update, and delete actions.

### Phase 4: Service Layer
* **Objective**: Create service modules orchestrating pricing calculations, state changes, agent assignments, and status log entries.

### Phase 5: API Layer
* **Objective**: Write Next.js App Router API endpoints to map client requests, validate inputs with Zod schemas, invoke services, and return standard JSON error envelopes.

### Phase 6: API Testing
* **Objective**: Perform contract and integration tests using automated query dispatch scripts to verify endpoint responses.

### Phase 7: Frontend Integration
* **Objective**: Connect the tracking dashboard views, dispatching panels, driver allocation prompts, and setting selectors to the backend APIs.

### Phase 8: UI Polish
* **Objective**: Enhance user panels, layout animations, responsive views, styles, and dark-theme configurations.

---

## 10. Architect Approval Questions

1. **Role Transitioning**: Should the existing database rows for user roles (which might hold `USER` / `ADMIN`) be migrated automatically on startup to mapping (`CUSTOMER` / `ADMIN`), or will we assume the roles are populated clean via registrations?
2. **Order Cancellations**: At which statuses is a customer allowed to cancel an order (`CANCELLED`)? Is cancellation restricted once an agent is `ASSIGNED` or package is `PICKED_UP`?
3. **Weight Limits**: Should we enforce a maximum package weight validation at the schema layer (e.g. 50kg limit), or delegate weight capacity limits to the active Rate Cards?
