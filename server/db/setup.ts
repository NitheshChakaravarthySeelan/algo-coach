import type { Database } from "bun:sqlite"

export function createTables(db: Database) {
  db.run("PRAGMA journal_mode = WAL")
  db.run("PRAGMA foreign_keys = ON")

  db.run(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "linkedin_user_id" text,
      "email" text NOT NULL UNIQUE,
      "email_verified" integer NOT NULL DEFAULT false,
      "image" text,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id"),
      "expires_at" integer NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL,
      "ip_address" text,
      "user_agent" text
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id"),
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "access_token" text,
      "refresh_token" text,
      "access_token_expires_at" integer,
      "refresh_token_expires_at" integer,
      "scope" text,
      "id_token" text,
      "password" text,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" integer NOT NULL,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "survey_response" (
      "id" text PRIMARY KEY NOT NULL,
      "email" text NOT NULL,
      "struggles" text NOT NULL,
      "desired_feature" text NOT NULL,
      "goals" text NOT NULL,
      "created_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "leetcode_account" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text UNIQUE REFERENCES "user"("id"),
      "leetcode_username" text NOT NULL,
      "total_solved" integer NOT NULL DEFAULT 0,
      "easy_solved" integer NOT NULL DEFAULT 0,
      "medium_solved" integer NOT NULL DEFAULT 0,
      "hard_solved" integer NOT NULL DEFAULT 0,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "daily_progress" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text REFERENCES "user"("id"),
      "date" integer NOT NULL,
      "problem_name" text NOT NULL,
      "difficulty" text NOT NULL,
      "problem_id" text NOT NULL,
      "topics" text NOT NULL,
      "status" text NOT NULL DEFAULT 'IN_PROGRESS',
      "created_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "user_preferences" (
      "user_id" text PRIMARY KEY NOT NULL REFERENCES "user"("id"),
      "experience_level" text NOT NULL,
      "goals" text NOT NULL,
      "weak_topics" text NOT NULL,
      "target_companies" text,
      "hours_per_week" integer NOT NULL,
      "target_date" integer,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "roadmap_plan" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL UNIQUE REFERENCES "user"("id"),
      "weeks" text NOT NULL,
      "current_week" integer NOT NULL DEFAULT 1,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "daily_plan" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id"),
      "date" integer NOT NULL,
      "week_number" integer NOT NULL,
      "topic" text NOT NULL,
      "problems" text NOT NULL,
      "explanation" text,
      "created_at" integer NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS "roadmap_job" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id"),
      "status" text NOT NULL DEFAULT 'pending',
      "progress" text,
      "result" text,
      "error" text,
      "created_at" integer NOT NULL,
      "updated_at" integer NOT NULL
    )
  `)

  // Add unique indexes for tables that might already exist without them
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_leetcode_account_user_id ON leetcode_account(user_id)")
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_roadmap_plan_user_id ON roadmap_plan(user_id)")
}
