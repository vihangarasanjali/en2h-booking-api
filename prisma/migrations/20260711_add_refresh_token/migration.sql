-- ============================================================
--  Migration: Add refreshToken column to users table
--  Generated: 2026-07-11
--
--  Stores a bcrypt hash of the user's active refresh token.
--  NULL indicates the user is logged out (no valid refresh token).
-- ============================================================

-- AlterTable
ALTER TABLE "users" ADD COLUMN "refreshToken" TEXT;
