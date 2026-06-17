import { eq } from "drizzle-orm"
import { db } from "../db"
import { roadmapJob, roadmapPlan, userPreferences } from "../db/schema"
import { createProvider, extractJson } from "./ai-provider"
import { searchLeetCodeProblems } from "./leetcode-search"

const provider = createProvider()

interface UserPreferences {
  experienceLevel: string
  goals: string[]
  weakTopics: string[]
  targetCompanies?: string[]
  hoursPerWeek: number
  targetDate?: string
}

interface RoadmapWeek {
  week: number
  topic: string
  description: string
  problemsCount: number
}

function buildPrompt(prefs: UserPreferences): string {
  return `You are a LeetCode coach creating a personalized study roadmap.

User Profile:
- Experience: ${prefs.experienceLevel}
- Goals: ${prefs.goals.join(", ")}
- Weak topics: ${prefs.weakTopics.join(", ")}
- Target companies: ${prefs.targetCompanies?.join(", ") || "Not specified"}
- Hours per week: ${prefs.hoursPerWeek}
- Target date: ${prefs.targetDate || "No deadline"}

Create a structured weekly roadmap that:
1. Starts with fundamentals and progresses to advanced topics
2. Prioritizes the user's weak topics
3. Allocates more weeks to harder topics
4. Is realistic given their hours per week

Return a JSON array where each entry has: week (number), topic (string), description (string), problemsCount (number).

IMPORTANT: Each topic MUST be a valid LeetCode problem tag name (e.g., "Arrays", "Strings", "Hash Table", "Dynamic Programming", "Linked List", "Binary Search", "Trees", "Graph", "Heap", "Backtracking", "Sliding Window", "Two Pointers", "Stack", "Queue", "Math", "Sorting", "Greedy", "Recursion", "Bit Manipulation"). Use STANDARD LeetCode tag names only, separated by commas if combining topics. EXAMPLE: "Binary Search, Bit Manipulation" not "Binary Search & Bit Manipulation".

Aim for 4-12 weeks total depending on the user's experience and goals.`
}

export async function generateRoadmap(preferences: UserPreferences): Promise<RoadmapWeek[]> {
  const prompt = buildPrompt(preferences)
  const text = extractJson(await provider.generate({ prompt, temperature: 0.7, jsonMode: true }))
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : parsed.weeks || parsed.roadmap || []
  } catch {
    throw new Error("Failed to parse roadmap from AI response")
  }
}

export async function processRoadmapJob(jobId: string): Promise<void> {
  const job = await db.query.roadmapJob.findFirst({ where: eq(roadmapJob.id, jobId) })
  if (!job) return

  await db.update(roadmapJob).set({ status: "processing", updatedAt: new Date() }).where(eq(roadmapJob.id, jobId))

  const prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, job.userId) })
  if (!prefs) {
    await db.update(roadmapJob).set({ status: "error", error: "Complete onboarding first", updatedAt: new Date() }).where(eq(roadmapJob.id, jobId))
    return
  }

  const prompt = buildPrompt({
    experienceLevel: prefs.experienceLevel,
    goals: prefs.goals,
    weakTopics: prefs.weakTopics,
    targetCompanies: prefs.targetCompanies,
    hoursPerWeek: prefs.hoursPerWeek,
    targetDate: prefs.targetDate?.toISOString(),
  })

  let fullText = ""
  try {
    for await (const chunk of provider.generateStream({ prompt, temperature: 0.7 })) {
      fullText += chunk
      await db.update(roadmapJob).set({ progress: fullText, updatedAt: new Date() }).where(eq(roadmapJob.id, jobId))
    }

    const cleaned = extractJson(fullText)
    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      await db.update(roadmapJob).set({ status: "error", error: "Failed to parse roadmap from AI response", updatedAt: new Date() }).where(eq(roadmapJob.id, jobId))
      return
    }

    const weeks = Array.isArray(parsed) ? parsed : parsed.weeks || parsed.roadmap || []

    await db.insert(roadmapPlan).values({
      id: crypto.randomUUID(),
      userId: job.userId,
      weeks: JSON.parse(JSON.stringify(weeks)),
      currentWeek: 1,
    }).onConflictDoUpdate({
      target: roadmapPlan.userId,
      set: { weeks: JSON.parse(JSON.stringify(weeks)), currentWeek: 1, updatedAt: new Date() },
    })

    await db.update(roadmapJob).set({
      status: "done",
      result: JSON.parse(JSON.stringify(weeks)),
      progress: fullText,
      updatedAt: new Date(),
    }).where(eq(roadmapJob.id, jobId))
  } catch (err: any) {
    await db.update(roadmapJob).set({
      status: "error",
      error: err.message || "Unknown error",
      updatedAt: new Date(),
    }).where(eq(roadmapJob.id, jobId))
  }
}

export function startJobProcessing(jobId: string): void {
  processRoadmapJob(jobId).catch((err) => console.error("Roadmap job failed:", err))
}

interface LeetCodeProblem {
  title: string
  titleSlug: string
  difficulty: "Easy" | "Medium" | "Hard"
  frontendQuestionId: string
  topicTags: { name: string; slug: string }[]
  acRate: number
}

interface DailyTask {
  problems: {
    title: string
    titleSlug: string
    difficulty: string
    topicTags: string[]
    leetcodeUrl: string
    acRate: number
  }[]
  explanation: string
}

export async function selectDailyProblems(params: {
  roadmap: RoadmapWeek[]
  currentWeek: number
  progress: { problemId: string; status: string }[]
  dedupCount: Record<string, number>
  solvedSlugs: string[]
  count?: number
  difficultyFilter?: "EASY" | "MEDIUM" | "HARD" | "MIXED"
  excludeSlugs?: string[]
}): Promise<DailyTask> {
  const {
    roadmap, currentWeek, dedupCount, solvedSlugs,
    count = 3, difficultyFilter = "MIXED", excludeSlugs: extraExclude = [],
  } = params
  const week = roadmap[currentWeek - 1]
  if (!week) throw new Error(`Week ${currentWeek} not found in roadmap`)

  const overusedSlugs = Object.entries(dedupCount)
    .filter(([, c]) => c >= 3)
    .map(([slug]) => slug)

  const exclude = [...new Set([...overusedSlugs, ...solvedSlugs, ...extraExclude])]

  const topicSlugs = parseTopicToSlugs(week.topic)
  let searchResults = await searchLeetCodeProblems({
    topics: topicSlugs,
    excludeSlugs: exclude,
    limit: 30,
  })

  if (!searchResults.length) {
    return {
      problems: [],
      explanation: `No unsolved problems found for ${week.topic}. Try a different topic or reset progress.`,
    }
  }

  if (difficultyFilter === "EASY") {
    const filtered = searchResults.filter((p) => p.difficulty === "Easy")
    if (filtered.length) searchResults = filtered
  } else if (difficultyFilter === "MEDIUM") {
    const filtered = searchResults.filter((p) => p.difficulty === "Medium")
    if (filtered.length) searchResults = filtered
  } else if (difficultyFilter === "HARD") {
    const filtered = searchResults.filter((p) => p.difficulty === "Hard")
    if (filtered.length) searchResults = filtered
  }

  const easy = searchResults.filter((p) => p.difficulty === "Easy").sort((a, b) => b.acRate - a.acRate)
  const medium = searchResults.filter((p) => p.difficulty === "Medium").sort((a, b) => b.acRate - a.acRate)
  const hard = searchResults.filter((p) => p.difficulty === "Hard").sort((a, b) => b.acRate - a.acRate)

  const selected: LeetCodeProblem[] = []
  const usedTags = new Set<string>()

  function pickFromBucket(bucket: LeetCodeProblem[], want: number): LeetCodeProblem[] {
    const result: LeetCodeProblem[] = []
    const diverse = bucket.filter((p) => p.topicTags.some((t) => !usedTags.has(t.slug)))
    const rest = bucket.filter((p) => !diverse.includes(p))
    for (const pool of [diverse, rest]) {
      for (const p of pool) {
        if (result.length >= want) break
        result.push(p)
        p.topicTags.forEach((t) => usedTags.add(t.slug))
      }
    }
    return result
  }

  if (difficultyFilter !== "MIXED") {
    const pool = difficultyFilter === "EASY" ? easy : difficultyFilter === "MEDIUM" ? medium : hard
    selected.push(...pickFromBucket(pool, count))
  } else {
    if (easy.length) selected.push(...pickFromBucket(easy, 1))
    if (medium.length) selected.push(...pickFromBucket(medium, 1))
    if (hard.length) selected.push(...pickFromBucket(hard, 1))
    if (selected.length < count) {
      const remaining = [...easy, ...medium, ...hard].filter(
        (p) => !selected.some((s) => s.titleSlug === p.titleSlug),
      )
      selected.push(...pickFromBucket(remaining, count - selected.length))
    }
  }

  const problems = selected.slice(0, count).map((p) => ({
    title: p.title,
    titleSlug: p.titleSlug,
    difficulty: p.difficulty,
    topicTags: p.topicTags.map((t) => t.name),
    leetcodeUrl: `https://leetcode.com/problems/${p.titleSlug}/`,
    acRate: p.acRate,
  }))

  const difficultySummary = problems.map((p) => p.difficulty).join(" → ")
  return {
    problems,
    explanation: `${week.topic}: ${problems.length} problem(s) - ${difficultySummary}. Progressing from easier to harder.`,
  }
}

function parseTopicToSlugs(topic: string): string[] {
  const parts = topic.split(/[,&/]/).map((s) => s.trim()).filter(Boolean)
  return parts.map((p) =>
    p.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  )
}
