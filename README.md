# 🚚 Last Mile Delivery Tracker

> A modern full-stack logistics management platform for managing the
> complete last-mile delivery lifecycle with **role-based access**,
> **OTP-based proof of delivery**, **pricing management**, **delivery
> agents**, **service zones**, and **real-time shipment tracking**.

> **Assignment Context:** Built as part of the **Unthinkable Solutions
> (Daffodil Software)** campus placement assignment.

------------------------------------------------------------------------

## ✨ Overview

Last Mile Delivery Tracker is a logistics management platform designed
for three different users:

-   👤 Customer
-   🛵 Delivery Agent
-   🛠️ Administrator

The platform demonstrates a production-inspired architecture using
**Next.js App Router**, **TypeScript**, **NextAuth**, **Drizzle ORM**,
and **PostgreSQL**, emphasizing maintainability, clean architecture, and
scalability.

------------------------------------------------------------------------

# 🚀 Key Features

## 🔐 Authentication & Security

-   Secure Login / Signup
-   Email Verification
-   Password Reset
-   Protected Routes
-   Role Based Access Control
-   JWT Session Management
-   Secure Password Hashing

------------------------------------------------------------------------

## 👤 Customer

-   Book parcel deliveries
-   Serviceability check using PIN code
-   Automatic delivery cost estimation
-   Track order progress
-   View shipment history
-   Manage profile
-   Demo Login

------------------------------------------------------------------------

## 🛵 Delivery Agent

-   View assigned deliveries
-   Update delivery status
-   Send Proof-of-Delivery OTP
-   Verify customer OTP
-   Complete deliveries securely

------------------------------------------------------------------------

## 🛠️ Admin

-   Dashboard analytics
-   Manage Orders
-   Manage Delivery Agents
-   Manage Service Zones
-   Configure Rate Cards
-   Assign delivery agents
-   Monitor delivery pipeline

------------------------------------------------------------------------

# 🔒 Proof of Delivery (OTP)

``` text
Customer creates order
        │
Admin confirms
        │
Admin assigns agent
        │
Agent picks up
        │
Out For Delivery
        │
Agent Sends OTP
        │
Customer Shares OTP
        │
OTP Verified
        │
Delivered
```

Security highlights:

-   6-digit OTP
-   Hashed before storage
-   Expiration time
-   Limited verification attempts
-   Resend support
-   Audit history

------------------------------------------------------------------------

# 👥 User Roles

  Role             Responsibilities
  ---------------- ------------------------------------------------
  Customer         Create orders, track shipments, manage profile
  Delivery Agent   Pickup, delivery, OTP verification
  Admin            Full logistics management

------------------------------------------------------------------------

# 🛠 Tech Stack

## Frontend

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS

## Backend

-   Next.js Route Handlers
-   NextAuth

## Database

-   PostgreSQL
-   Drizzle ORM

## Validation

-   Zod
-   React Hook Form

## Email

-   Resend (development/demo)

------------------------------------------------------------------------

# 🏗 Architecture

``` text
UI
 │
 ▼
API Routes
 │
 ▼
Service Layer
 │
 ▼
Repository Layer
 │
 ▼
Drizzle ORM
 │
 ▼
PostgreSQL
```

------------------------------------------------------------------------

# 📂 Project Structure

``` text
src/
├── app/
│   ├── (auth)
│   ├── (protected)
│   └── api
├── components/
├── services/
├── lib/
│   ├── dbconfig
│   ├── queries
│   ├── schema
│   └── utils
├── auth.ts
├── auth.config.ts
├── proxy.ts
└── route.ts
```

------------------------------------------------------------------------

# 📦 Core Modules

-   Authentication
-   Order Management
-   Delivery Agent Management
-   Zone Management
-   Rate Card Management
-   Shipment Tracking
-   Proof of Delivery
-   Settings

------------------------------------------------------------------------

# 📸 Screenshots

Replace these placeholders with actual screenshots.

-   Landing Page
-   Login
-   Customer Dashboard
-   Create Order
-   My Orders
-   Tracking
-   Admin Dashboard
-   Agent Dashboard
-   Zones
-   Rate Cards
-   Settings

------------------------------------------------------------------------

# ⚡ Demo

The login page provides one-click demo buttons:

-   Use Demo Customer
-   Use Demo Delivery Agent
-   Use Demo Admin

No manual credential entry required.

------------------------------------------------------------------------

# ⚙️ Installation

``` bash
git clone <repository-url>

cd Last-Mile-Delivery

pnpm install

cp .env.example .env

pnpm dev
```

------------------------------------------------------------------------

# 🌱 Environment Variables

  Variable              Purpose
  --------------------- -----------------------------
  DATABASE_URL          PostgreSQL connection
  NEXTAUTH_SECRET       Authentication secret
  NEXTAUTH_URL          Base application URL
  AUTH_TRUST_HOST       NextAuth production support
  RESEND_API_KEY        Email provider
  NEXT_PUBLIC_APP_URL   Frontend URL

------------------------------------------------------------------------

# 🚀 Deployment

Recommended platform:

-   Vercel

Checklist:

-   Configure all environment variables
-   Connect PostgreSQL database
-   Run Drizzle migrations
-   Deploy

------------------------------------------------------------------------

# 🧪 Quality

-   TypeScript
-   ESLint
-   Clean layered architecture
-   Reusable UI components
-   Responsive design
-   Protected routes
-   OTP-based Proof of Delivery

------------------------------------------------------------------------

# 🔮 Future Improvements

-   Live GPS tracking
-   Google Maps integration
-   SMS Gateway
-   Push Notifications
-   Route Optimization
-   Analytics Dashboard
-   Multi-warehouse support

------------------------------------------------------------------------

# 📄 License

This project was created for educational and placement evaluation
purposes.
