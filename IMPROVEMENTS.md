# AlgoCoach — Improvement Analysis

> **Migration notes for v0.1.6:**
> - `getCurrentWeek` now uses **problems solved per week's target** (not distinct solved days). If all 12 problems for week 1 are solved, it advances to week 2 even if solved in 1 day.

## Priority 1 — Data Loss / Crash Bugs

### 1.1 CRITICAL Completed roadmap causes daily plan generation crash
- **Files:** `server/routes/plan.ts:334`, `server/services/ai.ts:161`
- **Status:** ✅ Fixed — added guard in `POST /today` that returns a clear error if `currentWeek > roadmap.length`
- **Fix:** Guard in `POST /today` — if `currentWeek > roadmap.length`, return a clear error telling the user to regenerate their roadmap.

### 1.2 CRITICAL Daily plan explanation is never persisted
- **Files:** `server/routes/plan.ts:340`, `server/db/schema.ts:111-119`
- **Status:** ✅ Fixed — added `explanation` text column to `dailyPlan` schema, setup SQL, and store during insert
- **Fix:** Add `explanation` text column to `dailyPlan` in schema and setup SQL. Store it during insert.

### 1.3 CRITICAL Streak ignores manually logged problems
- **Files:** `server/routes/plan.ts:510-519`
- **Status:** ✅ Fixed — `GET /streak` now queries both `dailyPlan` and `dailyProgress` tables for SOLVED entries
- **Fix:** Merge solved dates from both `dailyPlan` (problems with `status === "SOLVED"`) and `dailyProgress` (`status === "SOLVED"`).

---

## Priority 2 — Missing Critical Features

### 2.1 HIGH No daily plan auto-generation on load
- **Files:** `src/components/dashboard/TodaysPlan.tsx:165`, `server/routes/plan.ts:247-265`
- **Status:** ✅ Fixed — `useEffect` auto-calls `generatePlan()` when `fetchPlan()` returns `exists === false`
- **Fix:** Auto-generate in frontend after `fetchPlan()` completes with `exists === false`.

### 2.2 HIGH No auto-advance when week is complete
- **Files:** `server/routes/plan.ts:47-75`, `src/components/dashboard/RoadmapOverview.tsx:339-357`
- **Status:** ✅ Handled — `currentWeek` is auto-calculated from solved days, so it advances automatically without a manual button

### 2.3 HIGH Advance button hidden when no daily plan exists for current week
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:229-231`
- **Status:** ✅ Handled — advance button was removed entirely; `currentWeek` is auto-calculated from solved days

---

## Priority 3 — Functional Bugs & Regressions

### 3.1 HIGH Difficulty filter persists across sessions
- **Files:** `src/components/dashboard/TodaysPlan.tsx:42,69-83`
- **Status:** ✅ Fixed — difficulty filter persists in localStorage but resets to MIXED on new day detection
- **Fix:** Reset to MIXED on new day, or add visual indicator.

### 3.2 HIGH Regenerate uses stored week number, not current roadmap week
- **Files:** `server/routes/plan.ts:455`
- **Status:** ✅ Fixed — regenerate now uses `getCurrentWeek()` like POST /today, not the stale `plan.weekNumber`
- **Fix:** Use roadmap's current `currentWeek` instead, or add a query parameter.

### 3.3 HIGH `setTimeout` race condition on unmount
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:47`
- **Status:** ✅ Fixed — timeout ID stored in ref, cleared in useEffect cleanup on unmount
- **Fix:** Store timeout ID in a `ref`, clear in `useEffect` cleanup.

### 3.4 MEDIUM Streak `Math.round` can be imprecise near midnight
- **Files:** `server/routes/plan.ts:530-558`
- **Status:** ✅ Fixed — normalized to UTC midnight via `Date.UTC` and use `Math.floor` for day difference
- **Fix:** Use `Math.floor` and normalize dates to UTC midnight.

### 3.5 MEDIUM In-memory rate limiter never evicts entries
- **Files:** `server/middleware/rate-limit.ts:8`
- **Status:** ✅ Fixed — added 60-second interval to purge expired entries from the store
- **Fix:** Add periodic cleanup of expired entries.

### 3.6 MEDIUM StatsCards totalSolved=0 proportions
- **Files:** `src/components/dashboard/StatsCards.tsx:73-79`
- **Status:** ✅ Fixed — removed `|| 1` fallback from max prop; `RingProgress` already guards `max > 0`

---

## Priority 4 — UX & Frontend Issues

### 4.1 MEDIUM No progress bar during long roadmap generation (2-3 min)
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:64-92`
- **Status:** ⏳ Deferred — SSE stream already shows real-time AI output; progress % requires backend changes

### 4.2 MEDIUM "Generate Today's Plan" has no streaming feedback
- **Files:** `src/components/dashboard/TodaysPlan.tsx:69-83`
- **Status:** ⏳ Deferred — button already shows spinner; full SSE would require a new endpoint

### 4.3 MEDIUM Marking problem solved doesn't update streak until refresh
- **Files:** `src/components/dashboard/TodaysPlan.tsx:85-106`, `src/pages/Dashboard.tsx:43`
- **Status:** ✅ Fixed — Dashboard listens for `algocoach:problem-solved` event and re-fetches streak
- **Fix:** Listen for custom event in Dashboard and re-fetch streak on problem solved.

### 4.4 LOW "Done" badge shows cumulative counts across multiple plans per week
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:291-313`
- **Status:** ✅ Fixed — progress percent now uses roadmap `problemsCount` as target instead of cumulative assigned count

### 4.5 LOW Naming: `fetchPlan` vs `generatePlan` could be clearer
- **Files:** `src/components/dashboard/TodaysPlan.tsx:48,69`

---

## Priority 5 — Architectural & Code Quality

### 5.1 HIGH Two database files — runtime vs drizzle mismatch
- **Files:** `server/db/index.ts:11` (`~/.algocoach/data.db`) vs `drizzle.config.ts:8` (`./data.db`)
- **Status:** ✅ Fixed — drizzle config now resolves `~/.algocoach/data.db` via `os.homedir()`

### 5.2 MEDIUM Missing DB indexes on frequently queried columns
- **Files:** `server/db/setup.ts:82-139`
- **Status:** ✅ Fixed — added indexes on `daily_plan(user_id, date)`, `daily_progress(user_id, problem_id)`, `roadmap_job(user_id)`

### 5.3 MEDIUM No social login providers configured
- **Files:** `server/auth/index.ts:8-14`
- **Status:** ⏳ By design — local CLI tool, always-on LOCAL_DEV mode

### 5.4 MEDIUM Missing Zod validation on POST/PATCH plan route bodies
- **Files:** `server/routes/plan.ts:270,350`
- **Status:** ✅ Fixed — added `difficultySchema`, `planStatusSchema`, `regenerateBodySchema` with safeParse validation

### 5.5 MEDIUM ~15 repeated try/catch error handlers — no global error middleware
- **Files:** `server/routes/plan.ts` (every route)
- **Status:** ✅ Fixed — added `app.onError()` global handler in `server/index.ts` as safety net for uncaught errors

### 5.6 LOW Empty plan when difficulty filter eliminates all AI results
- **Files:** `server/services/ai.ts:186-193`
- **Status:** ✅ Fixed — added early return with helpful message when difficulty filter leaves zero results

### 5.7 LOW `processRoadmapJob` fire-and-forget with redundant catch
- **Files:** `server/services/ai.ts:122-124`
- **Status:** ⏳ Acknowledged — error is already stored in DB; catch is harmless

---

## Priority 6 — Edge Cases

### 6.1 MEDIUM Empty/unmapped topic slugs sent to LeetCode API
- **Files:** `server/services/ai.ts:354-367`
- **Status:** ✅ Fixed — added `.filter(Boolean)` guard on returned slugs to exclude any empty strings

### 6.2 LOW AI provider selection ignores runtime env changes
- **Files:** `server/services/ai-provider.ts:141`
- **Status:** ⏳ By design — module-level singleton for simplicity; restart to change

### 6.3 LOW Two different status enums in same `dailyProgress` table
- **Files:** `server/routes/plan.ts:383-386`, `server/routes/leetcode.ts:132`
- **Status:** ⏳ Acknowledged — different workflows have different status values

### 6.4 LOW History endpoint — leetcodeUrl stored in plan is always valid
- **Files:** `server/routes/plan.ts:569-593`
- **Status:** Not an issue — slug is stored, URL is always valid

---

## Priority 7 — Cleanup / Technical Debt

### 7.1 LOW Dead file: `server/local-dev/test-ai.ts`
- **Files:** `server/local-dev/test-ai.ts`
- **Status:** ✅ Fixed — moved to `scripts/test-ai.ts`

### 7.2 LOW Jest types dependency may be unused
- **Files:** `package.json` devDependencies
- **Status:** ⏳ Acknowledged — project uses bun test

### 7.3 LOW `/drizzle/` migration dir not gitignored
- **Files:** `.gitignore`
- **Status:** ✅ Fixed — added `drizzle` to `.gitignore`

### 7.4 LOW Separate DB per process — document if clustered
- **Files:** `server/db/index.ts:23-26`
- **Status:** ⏳ Acknowledged — singleton works for single-process Bun
