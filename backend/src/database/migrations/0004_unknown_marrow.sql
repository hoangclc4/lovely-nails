ALTER TABLE "session_add_ons" DROP CONSTRAINT IF EXISTS "session_add_ons_add_on_id_service_add_ons_id_fk";
--> statement-breakpoint
ALTER TABLE "session_time_extensions" ALTER COLUMN "added_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booking_number" text;--> statement-breakpoint
ALTER TABLE "session_add_ons" ADD COLUMN IF NOT EXISTS "name" varchar(100);--> statement-breakpoint
ALTER TABLE "work_shifts" DROP COLUMN IF EXISTS "total_hours";--> statement-breakpoint
ALTER TABLE "session_add_ons" DROP COLUMN IF EXISTS "add_on_id";--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_number_unique" UNIQUE ("booking_number");
EXCEPTION WHEN duplicate_object THEN null;
END $$;