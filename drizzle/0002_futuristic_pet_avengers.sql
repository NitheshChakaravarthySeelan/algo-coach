ALTER TABLE "daily_progress" ALTER COLUMN "topics" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "daily_progress" ADD COLUMN "status" text DEFAULT 'IN_PROGRESS' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "linkedin_user_id" text;