import {
  sqliteTable,
  text as sqliteText,
  integer,
} from "drizzle-orm/sqlite-core"
import { jsonText, textArray } from "./custom-types"

const text = sqliteText

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  linkedinUserId: text("linkedin_user_id"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
})

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const surveyResponse = sqliteTable("survey_response", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  struggles: text("struggles").notNull(),
  desiredFeature: text("desired_feature").notNull(),
  goals: text("goals").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const leetcodeAccount = sqliteTable("leetcode_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").unique().references(() => user.id),
  leetcodeUsername: text("leetcode_username").notNull(),
  totalSolved: integer("total_solved").notNull().default(0),
  easySolved: integer("easy_solved").notNull().default(0),
  mediumSolved: integer("medium_solved").notNull().default(0),
  hardSolved: integer("hard_solved").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const dailyProgress = sqliteTable("daily_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  problemName: text("problem_name").notNull(),
  difficulty: text("difficulty").notNull(),
  problemId: text("problem_id").notNull(),
  topics: textArray()("topics").notNull(),
  status: text("status").notNull().default("IN_PROGRESS"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => user.id),
  experienceLevel: text("experience_level").notNull(),
  goals: textArray()("goals").notNull(),
  weakTopics: textArray()("weak_topics").notNull(),
  targetCompanies: textArray()("target_companies"),
  hoursPerWeek: integer("hours_per_week").notNull(),
  targetDate: integer("target_date", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const roadmapPlan = sqliteTable("roadmap_plan", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id),
  weeks: jsonText<{ week: number; topic: string; description: string; problemsCount: number }[]>()("weeks").notNull(),
  currentWeek: integer("current_week").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const dailyPlan = sqliteTable("daily_plan", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  weekNumber: integer("week_number").notNull(),
  topic: text("topic").notNull(),
  problems: jsonText<{ title: string; titleSlug: string; difficulty: string; topicTags: string[]; leetcodeUrl: string; acRate: number; status?: string; completedAt?: string | null }[]>()("problems").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const roadmapJob = sqliteTable("roadmap_job", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  status: text("status").notNull().default("pending"),
  progress: text("progress"),
  result: jsonText<{ week: number; topic: string; description: string; problemsCount: number }[]>()("result"),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})
