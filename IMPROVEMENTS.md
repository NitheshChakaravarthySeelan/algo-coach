# AlgoCoach — Improvement Analysis

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

### 3.6 MEDIUM Wrong field name / proportions in StatsCards
- **Files:** `src/components/dashboard/StatsCards.tsx:73-79`
- **Problem:** Ring progress uses `stats.totalSolved || 1` as max. When `totalSolved = 0`, it becomes 1 showing incorrect proportions.
- **Impact:** Minor visual issue when totalSolved = 0.

---

## Priority 4 — UX & Frontend Issues

### 4.1 MEDIUM No progress bar during long roadmap generation (2-3 min)
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:64-92`
- **Problem:** SSE stream shows raw text in a `<pre>` block. No estimated time or progress bar.
- **Fix:** Add progress percentage or polished loading animation.

### 4.2 MEDIUM "Generate Today's Plan" has no streaming feedback
- **Files:** `src/components/dashboard/TodaysPlan.tsx:69-83`
- **Problem:** Synchronous JSON request blocks for 10-30s during AI selection. Button appears stuck.
- **Fix:** SSE-based generation for daily plans, or better UI feedback.

### 4.3 MEDIUM Marking problem solved doesn't update streak until refresh
- **Files:** `src/components/dashboard/TodaysPlan.tsx:85-106`, `src/pages/Dashboard.tsx:43`
- **Problem:** Streak is fetched once on load and never re-fetched after marking a problem solved.
- **Fix:** Emit callback from TodaysPlan when problem is solved, or have the PATCH endpoint return updated streak data.

### 4.4 LOW "Done" badge shows cumulative counts across multiple plans per week
- **Files:** `src/components/dashboard/RoadmapOverview.tsx:291-313`
- **Problem:** Week progress shows assigned count (all problems across all plans for that week) rather than roadmap target count.

### 4.5 LOW Naming: `fetchPlan` vs `generatePlan` could be clearer
- **Files:** `src/components/dashboard/TodaysPlan.tsx:48,69`

---

## Priority 5 — Architectural & Code Quality

### 5.1 HIGH Two database files — runtime vs drizzle mismatch
- **Files:** `server/db/index.ts:11` (`~/.algocoach/data.db`) vs `drizzle.config.ts:8` (`./data.db`)
- **Problem:** Migrations run via `drizzle-kit` operate on wrong database.
- **Fix:** Align drizzle config path with runtime path.

### 5.2 MEDIUM Missing DB indexes on frequently queried columns
- **Files:** `server/db/setup.ts:82-139`
- **Missing indexes:**
  - `daily_plan(user_id, date)` — queried by every GET/POST /today
  - `daily_progress(user_id, problem_id)` — queried by PATCH problem status and POST /leetcode/log
  - `roadmap_job(user_id)` — queried by GET /roadmap/jobs/:jobId

### 5.3 MEDIUM No social login providers configured
- **Files:** `server/auth/index.ts:8-14`
- **Problem:** Auth config has no login methods configured. Only usable with `LOCAL_DEV=true`. Unusable in production.

### 5.4 MEDIUM Missing Zod validation on POST/PATCH plan route bodies
- **Files:** `server/routes/plan.ts:270,350`
- **Problem:** POST /today does `body.difficulty` with no schema validation. PATCH checks status allowlist but doesn't validate other fields.

### 5.5 MEDIUM ~15 repeated try/catch error handlers — no global error middleware
- **Files:** `server/routes/plan.ts` (every route)
- **Problem:** Every route repeats `try { ... } catch (err) { return c.json({ success: false, error: err.message }, 500) }`.

### 5.6 LOW Empty plan when difficulty filter eliminates all AI results
- **Files:** `server/services/ai.ts:186-193`
- **Problem:** If filtering search results by difficulty empties the array, `pickFromBucket` gets empty buckets and returns empty problems without helpful explanation.

### 5.7 LOW `processRoadmapJob` fire-and-forget with redundant catch
- **Files:** `server/services/ai.ts:122-124`
- **Problem:** `startJobProcessing` calls `.catch(console.error)` but `processRoadmapJob` already handles errors internally by updating DB with status "error".

---

## Priority 6 — Edge Cases

### 6.1 MEDIUM Empty/unmapped topic slugs sent to LeetCode API
- **Files:** `server/services/ai.ts:354-367`
- **Problem:** If AI generates an unexpected topic format, `parseTopicToSlugs` may produce empty slugs (`['']`) that get sent to LeetCode API.

### 6.2 LOW AI provider selection ignores runtime env changes
- **Files:** `server/services/ai-provider.ts:141`
- **Problem:** `createProvider()` called once at module load. Env changes need server restart.

### 6.3 LOW Two different status enums in same `dailyProgress` table
- **Files:** `server/routes/plan.ts:383-386`, `server/routes/leetcode.ts:132`
- **Problem:** Manual log uses `IN_PROGRESS`; daily plan uses `SOLVED | TRIED | SKIPPED | PENDING`. Different semantics, same table.

### 6.4 LOW History endpoint — leetcodeUrl stored in plan is always valid
- **Files:** `server/routes/plan.ts:569-593`
- **Status:** Not a real issue — slug is stored, URL is valid.

---

## Priority 7 — Cleanup / Technical Debt

### 7.1 LOW Dead file: `server/local-dev/test-ai.ts`
- **Files:** `server/local-dev/test-ai.ts`
- **Problem:** Test script with console.log in production source tree.

### 7.2 LOW Jest types dependency may be unused
- **Files:** `package.json` devDependencies
- **Note:** Project uses `bun test`, not jest. Verify alignment.

### 7.3 LOW `/drizzle/` migration dir not gitignored
- **Files:** `.gitignore`
- **Fix:** Add `/drizzle/` to `.gitignore`.

### 7.4 LOW Separate DB per process — document if clustered
- **Files:** `server/db/index.ts:23-26`
- **Note:** Singleton works for single-process Bun. Document limitation if ever clustered.
