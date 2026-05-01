ALTER TABLE "bookings" ADD COLUMN "booking_number" text;--> statement-breakpoint
UPDATE "bookings"
SET "booking_number" = TO_CHAR("booking_date"::date, 'YYYYMMDD') || '_' || sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY booking_date ORDER BY created_at) AS rn
  FROM bookings
) AS sub
WHERE "bookings".id = sub.id;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number");
