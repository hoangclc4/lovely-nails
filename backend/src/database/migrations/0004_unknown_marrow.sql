ALTER TABLE "session_add_ons" DROP CONSTRAINT "session_add_ons_add_on_id_service_add_ons_id_fk";
--> statement-breakpoint
ALTER TABLE "session_time_extensions" ALTER COLUMN "added_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session_add_ons" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "work_shifts" DROP COLUMN "total_hours";--> statement-breakpoint
ALTER TABLE "session_add_ons" DROP COLUMN "add_on_id";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number");