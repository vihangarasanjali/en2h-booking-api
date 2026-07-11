-- ============================================================
--  Migration: Remove NO_SHOW from BookingStatus enum
--  Generated: 2026-07-10
-- ============================================================

-- AlterEnum
-- PostgreSQL does not support removing enum values directly.
-- The standard approach is to:
--   1. Create a new enum without NO_SHOW
--   2. Cast the column to the new enum
--   3. Drop the old enum and rename the new one

-- Step 1: Create the new enum type
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Step 2: Alter the column to use the new enum (casting via text)
ALTER TABLE "bookings"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "bookings"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING ("status"::text::"BookingStatus_new");

-- Step 3: Restore the default
ALTER TABLE "bookings"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"BookingStatus_new";

-- Step 4: Drop the old enum and rename the new one
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
