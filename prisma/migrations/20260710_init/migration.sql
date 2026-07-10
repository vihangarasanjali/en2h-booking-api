-- ============================================================
--  Initial migration for Booking Platform
--  Generated: 2026-07-10
-- ============================================================

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "users" (
    "id"        TEXT        NOT NULL,
    "email"     TEXT        NOT NULL,
    "password"  TEXT        NOT NULL,
    "name"      TEXT        NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id"          TEXT           NOT NULL,
    "title"       TEXT           NOT NULL,
    "description" TEXT,
    "duration"    INTEGER        NOT NULL,
    "price"       DECIMAL(10,2)  NOT NULL,
    "isActive"    BOOLEAN        NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id"            TEXT             NOT NULL,
    "customerName"  TEXT             NOT NULL,
    "customerEmail" TEXT             NOT NULL,
    "customerPhone" TEXT             NOT NULL,
    "bookingDate"   DATE             NOT NULL,
    "bookingTime"   TIME             NOT NULL,
    "status"        "BookingStatus"  NOT NULL DEFAULT 'PENDING',
    "notes"         TEXT,
    "serviceId"     TEXT             NOT NULL,
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key"         ON "users"("email");
CREATE INDEX        "users_email_idx"          ON "users"("email");

-- CreateIndex
CREATE INDEX        "services_isActive_idx"    ON "services"("isActive");

-- CreateIndex
CREATE INDEX        "bookings_serviceId_idx"             ON "bookings"("serviceId");
CREATE INDEX        "bookings_bookingDate_idx"           ON "bookings"("bookingDate");
CREATE INDEX        "bookings_status_idx"                ON "bookings"("status");
CREATE INDEX        "bookings_customerEmail_idx"         ON "bookings"("customerEmail");
CREATE INDEX        "bookings_serviceId_bookingDate_idx" ON "bookings"("serviceId", "bookingDate");

-- AddForeignKey
ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_serviceId_fkey"
    FOREIGN KEY ("serviceId")
    REFERENCES "services"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
