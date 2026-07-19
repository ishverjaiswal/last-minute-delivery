CREATE TABLE "delivery_agent_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"phone" text NOT NULL,
	"assignedZoneId" text,
	"availability" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_agent_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "delivery_otp" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"otpHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verifiedAt" timestamp,
	"verifiedBy" text,
	"attemptCount" integer DEFAULT 0 NOT NULL,
	"resentCount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"status" text NOT NULL,
	"changedById" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"pickupAddress" text NOT NULL,
	"deliveryAddress" text NOT NULL,
	"deliveryPinCode" text NOT NULL,
	"weight" double precision NOT NULL,
	"length" double precision,
	"width" double precision,
	"height" double precision,
	"volumetricWeight" double precision,
	"billableWeight" double precision,
	"orderType" text DEFAULT 'B2C' NOT NULL,
	"paymentType" text DEFAULT 'PREPAID' NOT NULL,
	"codSurchargeAmount" double precision DEFAULT 0 NOT NULL,
	"pickupPinCode" text,
	"pickupZoneId" text,
	"zoneId" text NOT NULL,
	"rateCardId" text NOT NULL,
	"agentId" text,
	"status" text NOT NULL,
	"price" double precision NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rate_card" (
	"id" text PRIMARY KEY NOT NULL,
	"zoneId" text NOT NULL,
	"minWeight" double precision NOT NULL,
	"maxWeight" double precision NOT NULL,
	"basePrice" double precision NOT NULL,
	"orderType" text DEFAULT 'B2C' NOT NULL,
	"zoneType" text DEFAULT 'INTRA' NOT NULL,
	"codSurcharge" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "zone" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pin_codes" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';--> statement-breakpoint
ALTER TABLE "delivery_agent_profile" ADD CONSTRAINT "delivery_agent_profile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_agent_profile" ADD CONSTRAINT "delivery_agent_profile_assignedZoneId_zone_id_fk" FOREIGN KEY ("assignedZoneId") REFERENCES "public"."zone"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_otp" ADD CONSTRAINT "delivery_otp_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_otp" ADD CONSTRAINT "delivery_otp_verifiedBy_user_id_fk" FOREIGN KEY ("verifiedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_otp" ADD CONSTRAINT "delivery_otp_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedById_user_id_fk" FOREIGN KEY ("changedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_pickupZoneId_zone_id_fk" FOREIGN KEY ("pickupZoneId") REFERENCES "public"."zone"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_zoneId_zone_id_fk" FOREIGN KEY ("zoneId") REFERENCES "public"."zone"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_rateCardId_rate_card_id_fk" FOREIGN KEY ("rateCardId") REFERENCES "public"."rate_card"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_agentId_delivery_agent_profile_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."delivery_agent_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_card" ADD CONSTRAINT "rate_card_zoneId_zone_id_fk" FOREIGN KEY ("zoneId") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE no action;