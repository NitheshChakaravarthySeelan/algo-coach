import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { searchLeetCodeProblems } from "./leetcode-search"

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.warn("GEMINI_API_KEY not set — AI features will fail")
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

const searchTool = {
  functionDeclarations: [{
    name: "search_leetcode_problems",
    description: "Search for real LeetCode problems by topic tags and difficulty. Use this to find actual problems from LeetCode instead of making them up.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topics: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Topic tags to filter by (e.g. array, dynamic-programming, graph)",
        },
        difficulty: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["EASY", "MEDIUM", "HARD"],
          description: "Difficulty level to filter by",
        },
        excludeSlugs: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Problem slugs to exclude (for deduplication)",
        },
      },
      required: ["topics"],
    },
  }],
}

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
  if (!genAI) throw new Error("GEMINI_API_KEY not configured")

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  })

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

  const result = await model.generateContent(prompt)
  const text = result.response.text()

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
  if (!genAI) throw new Error("GEMINI_API_KEY not configured")

  const { roadmap, currentWeek, progress, dedupCount, solvedSlugs } = params
  const week = roadmap[currentWeek - 1]
  if (!week) throw new Error(`Week ${currentWeek} not found in roadmap`)

  const overusedSlugs = Object.entries(dedupCount)
    .filter(([, count]) => count >= 3)
    .map(([slug]) => slug)

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { temperature: 0.7 },
  })

  const prompt = `You are a LeetCode coach creating today's practice plan.

Current week: ${currentWeek}
Focus topic: ${week.topic}
Week description: ${week.description}

Problems already solved by the user: ${solvedSlugs.join(", ") || "none"}
Problems that have been suggested 3+ times (DO NOT suggest these): ${overusedSlugs.join(", ") || "none"}

Use the search_leetcode_problems tool to find real LeetCode problems for the focus topic "${week.topic}".
Select 3 problems that:
1. Are directly relevant to "${week.topic}"
2. Progress from easier to harder within the topic
3. Have NOT been solved by the user
4. Are NOT in the overused list
5. Cover different subtopics within "${week.topic}" if possible

After getting search results, pick the best 3 and return them.`

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [searchTool],
  })

  const response = result.response
  const toolCalls = response.functionCalls()

  let searchResults: LeetCodeProblem[] = []

  if (toolCalls && toolCalls.length > 0) {
    for (const call of toolCalls) {
      if (call.name === "search_leetcode_problems") {
        const args = call.args as {
          topics: string[]
          difficulty?: "EASY" | "MEDIUM" | "HARD"
          excludeSlugs?: string[]
        }
        const exclude = [...new Set([
          ...(args.excludeSlugs || []),
          ...overusedSlugs,
          ...solvedSlugs,
        ])]
        searchResults = await searchLeetCodeProblems({
          topics: args.topics,
          difficulty: args.difficulty,
          excludeSlugs: exclude,
          limit: 10,
        })
      }
    }
  }

  if (!searchResults.length) {
    searchResults = await searchLeetCodeProblems({
      topics: [week.topic],
      excludeSlugs: [...overusedSlugs, ...solvedSlugs],
      limit: 10,
    })
  }

  const selectionPrompt = `You are a LeetCode coach. From the following real LeetCode problems, select the best 3 for today's practice.

Focus topic: ${week.topic}
User's solved problems: ${solvedSlugs.join(", ") || "none"}

Available problems:
${JSON.stringify(searchResults, null, 2)}

Select 3 problems that:
1. Are most relevant to "${week.topic}"
2. Progress from easier to harder
3. Cover different aspects of the topic
4. Have NOT been solved by the user

Return JSON with: problems (array of {title, titleSlug, difficulty, topicTags, leetcodeUrl, acRate}) and explanation (string describing why these were chosen).`

  const selectionResult = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: selectionPrompt }] }],
    generationConfig: {
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  })

  const selectionText = selectionResult.response.text()
  try {
    const parsed = JSON.parse(selectionText)
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
