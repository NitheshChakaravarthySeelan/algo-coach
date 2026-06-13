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

export async function generateRoadmap(preferences: UserPreferences): Promise<RoadmapWeek[]> {
  const prompt = `You are a LeetCode coach creating a personalized study roadmap.

User Profile:
- Experience: ${preferences.experienceLevel}
- Goals: ${preferences.goals.join(", ")}
- Weak topics: ${preferences.weakTopics.join(", ")}
- Target companies: ${preferences.targetCompanies?.join(", ") || "Not specified"}
- Hours per week: ${preferences.hoursPerWeek}
- Target date: ${preferences.targetDate || "No deadline"}

Create a structured weekly roadmap that:
1. Starts with fundamentals and progresses to advanced topics
2. Prioritizes the user's weak topics
3. Allocates more weeks to harder topics
4. Is realistic given their hours per week

Return a JSON array where each entry has: week (number), topic (string), description (string), problemsCount (number).

Aim for 4-12 weeks total depending on the user's experience and goals.`

  const text = extractJson(await provider.generate({ prompt, temperature: 0.7, jsonMode: true }))

  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : parsed.weeks || parsed.roadmap || []
  } catch {
    throw new Error("Failed to parse roadmap from AI response")
  }
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

export async function generateDailyTask(params: {
  roadmap: RoadmapWeek[]
  currentWeek: number
  progress: { problemId: string; status: string }[]
  dedupCount: Record<string, number>
  solvedSlugs: string[]
}): Promise<DailyTask> {
  const { roadmap, currentWeek, dedupCount, solvedSlugs } = params
  const week = roadmap[currentWeek - 1]
  if (!week) throw new Error(`Week ${currentWeek} not found in roadmap`)

  const overusedSlugs = Object.entries(dedupCount)
    .filter(([, count]) => count >= 3)
    .map(([slug]) => slug)

  const exclude = [...new Set([...overusedSlugs, ...solvedSlugs])]

  const searchResults = await searchLeetCodeProblems({
    topics: [week.topic],
    excludeSlugs: exclude,
    limit: 15,
  })

  if (!searchResults.length) {
    return {
      problems: [],
      explanation: `No unsolved problems found for ${week.topic}. Try a different topic or reset progress.`,
    }
  }

  const prompt = `You are a LeetCode coach. From the following real LeetCode problems, select the best 3 for today's practice.

Focus topic: ${week.topic} (week ${currentWeek})
${week.description ? `Week goal: ${week.description}` : ''}

Available problems:
${JSON.stringify(searchResults, null, 2)}

Select 3 problems that:
1. Are most relevant to "${week.topic}"
2. Progress from easier to harder
3. Cover different aspects of the topic

Return JSON: { problems: [{title, titleSlug, difficulty, topicTags: string[], leetcodeUrl, acRate}], explanation: string }`

  try {
    const text = extractJson(await provider.generate({ prompt, temperature: 0.5, jsonMode: true }))
    const parsed = JSON.parse(text)
    return {
      problems: (parsed.problems || []).map((p: Record<string, unknown>) => ({
        title: p.title as string,
        titleSlug: p.titleSlug as string,
        difficulty: p.difficulty as string,
        topicTags: Array.isArray(p.topicTags) ? p.topicTags.map((t: unknown) => typeof t === "string" ? t : (t as Record<string, string>).name || (t as Record<string, string>).slug || "") : [],
        leetcodeUrl: `https://leetcode.com/problems/${p.titleSlug as string}/`,
        acRate: typeof p.acRate === "number" ? p.acRate : 0,
      })),
      explanation: parsed.explanation as string || "",
    }
  } catch {
    const fallback = searchResults.slice(0, 3).map((p) => ({
      title: p.title,
      titleSlug: p.titleSlug,
      difficulty: p.difficulty,
      topicTags: p.topicTags.map((t) => t.name),
      leetcodeUrl: `https://leetcode.com/problems/${p.titleSlug}/`,
      acRate: p.acRate,
    }))
    return {
      problems: fallback,
      explanation: `3 problems on ${week.topic}`,
    }
  }
}
