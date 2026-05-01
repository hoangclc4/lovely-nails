ALTER TABLE "service_sessions" ADD COLUMN IF NOT EXISTS "session_number" text;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "service_sessions" ADD CONSTRAINT "service_sessions_session_number_unique" UNIQUE ("session_number");
EXCEPTION WHEN duplicate_object THEN null;
END $$;
