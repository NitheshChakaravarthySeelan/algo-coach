import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  linkedinUserId: text("linkedin_user_id"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const waitlistEntry = pgTable("waitlist_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  leetcodeUsername: text("leetcode_username"),
  experience: text("experience").notNull(),
  struggles: text("struggles"),
  desiredFeature: text("desired_feature"),
  goals: text("goals"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const surveyResponse = pgTable("survey_response", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  struggles: text("struggles").notNull(),
  desiredFeature: text("desired_feature").notNull(),
  goals: text("goals").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leetcodeAccount = pgTable("leetcode_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  leetcodeUsername: text("leetcode_username").notNull(),
  totalSolved: integer("total_solved").notNull().default(0),
  easySolved: integer("easy_solved").notNull().default(0),
  mediumSolved: integer("medium_solved").notNull().default(0),
  hardSolved: integer("hard_solved").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyProgress = pgTable("daily_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  date: timestamp("date").notNull().defaultNow(),
  problemName: text("problem_name").notNull(),
  difficulty: text("difficulty").notNull(),
  problemId: text("problem_id").notNull(),
  topics: text("topics").array().notNull(),
  status: text("status").notNull().default("IN_PROGRESS"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
