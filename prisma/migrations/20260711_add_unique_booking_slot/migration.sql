-- ============================================================
--  Migration: Add unique constraint to prevent double-booking
--  Generated: 2026-07-11
--
--  A service slot (serviceId + bookingDate + bookingTime) must
--  be unique so that the same time slot cannot be booked twice.
-- ============================================================

-- CreateIndex (unique)
CREATE UNIQUE INDEX "bookings_unique_service_slot"
  ON "bookings"("serviceId", "bookingDate", "bookingTime");
