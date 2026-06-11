CREATE TABLE "daily_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"problem_name" text NOT NULL,
	"difficulty" text NOT NULL,
	"problem_id" text NOT NULL,
	"topics" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leetcode_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"leetcode_username" text NOT NULL,
	"total_solved" integer DEFAULT 0 NOT NULL,
	"easy_solved" integer DEFAULT 0 NOT NULL,
	"medium_solved" integer DEFAULT 0 NOT NULL,
	"hard_solved" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leetcode_account" ADD CONSTRAINT "leetcode_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;