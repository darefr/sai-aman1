-- ============================================================================
-- Hotel Sai Aman — Database schema (idempotent)
-- Run this once against your PostgreSQL database (Neon, Supabase, Vercel PG…).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Better Auth core tables (camelCase columns match Better Auth defaults)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "role" text NOT NULL DEFAULT 'customer',
  "banned" boolean DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Customer profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "customer_profiles" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "phone" text,
  "address" text,
  "city" text,
  "country" text,
  "postal_code" text,
  "nationality" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "rooms" (
  "id" text PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "beds" text NOT NULL,
  "max_guests" integer NOT NULL DEFAULT 2,
  "size_sqm" integer NOT NULL DEFAULT 20,
  "price_per_night" numeric(10,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'NPR',
  "total_units" integer NOT NULL DEFAULT 1,
  "amenities" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "gallery" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "virtual_tour_url" text,
  "featured" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "rooms_slug_idx" ON "rooms" ("slug");
CREATE INDEX IF NOT EXISTS "rooms_active_idx" ON "rooms" ("active");

CREATE TABLE IF NOT EXISTS "room_blocks" (
  "id" text PRIMARY KEY,
  "room_id" text NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "units" integer NOT NULL DEFAULT 1,
  "reason" text NOT NULL DEFAULT 'maintenance',
  "note" text,
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "room_blocks_room_idx" ON "room_blocks" ("room_id");
CREATE INDEX IF NOT EXISTS "room_blocks_date_idx" ON "room_blocks" ("start_date", "end_date");

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "bookings" (
  "id" text PRIMARY KEY,
  "reference" text NOT NULL UNIQUE,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "room_id" text NOT NULL REFERENCES "rooms"("id") ON DELETE RESTRICT,
  "guest_name" text NOT NULL,
  "guest_email" text NOT NULL,
  "guest_phone" text NOT NULL,
  "check_in" date NOT NULL,
  "check_out" date NOT NULL,
  "nights" integer NOT NULL,
  "adults" integer NOT NULL DEFAULT 1,
  "children" integer NOT NULL DEFAULT 0,
  "units_booked" integer NOT NULL DEFAULT 1,
  "room_rate" numeric(10,2) NOT NULL,
  "subtotal" numeric(10,2) NOT NULL,
  "discount_amount" numeric(10,2) NOT NULL DEFAULT 0,
  "tax_amount" numeric(10,2) NOT NULL DEFAULT 0,
  "total" numeric(10,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'NPR',
  "coupon_code" text,
  "special_requests" text,
  "status" text NOT NULL DEFAULT 'pending',
  "payment_status" text NOT NULL DEFAULT 'unpaid',
  "cancelled_at" timestamp,
  "cancellation_reason" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_reference_idx" ON "bookings" ("reference");
CREATE INDEX IF NOT EXISTS "bookings_user_idx" ON "bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "bookings_room_idx" ON "bookings" ("room_id");
CREATE INDEX IF NOT EXISTS "bookings_date_idx" ON "bookings" ("check_in", "check_out");
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" ("status");

CREATE TABLE IF NOT EXISTS "booking_guests" (
  "id" text PRIMARY KEY,
  "booking_id" text NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "full_name" text NOT NULL,
  "is_child" boolean NOT NULL DEFAULT false,
  "age" integer
);

-- ---------------------------------------------------------------------------
-- Payments + invoices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "payments" (
  "id" text PRIMARY KEY,
  "booking_id" text NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'NPR',
  "status" text NOT NULL DEFAULT 'initiated',
  "transaction_ref" text NOT NULL UNIQUE,
  "provider_ref" text,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "payments_booking_idx" ON "payments" ("booking_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_txn_idx" ON "payments" ("transaction_ref");

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" text PRIMARY KEY,
  "booking_id" text NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "number" text NOT NULL UNIQUE,
  "issued_at" timestamp NOT NULL DEFAULT now(),
  "snapshot" jsonb NOT NULL
);

-- ---------------------------------------------------------------------------
-- Coupons / offers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" text PRIMARY KEY,
  "code" text NOT NULL UNIQUE,
  "description" text,
  "type" text NOT NULL DEFAULT 'percent',
  "value" numeric(10,2) NOT NULL,
  "min_nights" integer NOT NULL DEFAULT 1,
  "min_amount" numeric(10,2) NOT NULL DEFAULT 0,
  "max_redemptions" integer,
  "times_redeemed" integer NOT NULL DEFAULT 0,
  "starts_at" date,
  "expires_at" date,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" ("code");

CREATE TABLE IF NOT EXISTS "offers" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "badge" text,
  "image" text,
  "coupon_code" text,
  "cta_label" text,
  "active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Reviews / gallery / faqs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" text PRIMARY KEY,
  "author" text NOT NULL,
  "country" text,
  "rating" integer NOT NULL DEFAULT 5,
  "quote" text NOT NULL,
  "stay_type" text,
  "approved" boolean NOT NULL DEFAULT false,
  "featured" boolean NOT NULL DEFAULT false,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "gallery" (
  "id" text PRIMARY KEY,
  "src" text NOT NULL,
  "alt" text NOT NULL,
  "category" text NOT NULL DEFAULT 'general',
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "faqs" (
  "id" text PRIMARY KEY,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- CMS content + settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "cms_content" (
  "key" text PRIMARY KEY,
  "value" jsonb NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "settings" (
  "key" text PRIMARY KEY,
  "value" jsonb NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Notifications + audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" text PRIMARY KEY,
  "user_id" text REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL DEFAULT 'system',
  "title" text NOT NULL,
  "body" text NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" text PRIMARY KEY,
  "actor_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "actor_email" text,
  "action" text NOT NULL,
  "entity" text,
  "entity_id" text,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Data integrity guards
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dates_chk" CHECK ("check_out" > "check_in");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "room_blocks" ADD CONSTRAINT "room_blocks_dates_chk" CHECK ("end_date" > "start_date");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
