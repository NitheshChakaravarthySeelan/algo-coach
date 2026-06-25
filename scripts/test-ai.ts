
import { getDb } from "../server/db"
import { userPreferences, roadmapPlan } from "../server/db/schema"
import { eq } from "drizzle-orm"
import { createProvider, extractJson } from "../server/services/ai-provider"

const USER_ID = process.env.LOCAL_USER_ID || "dev-user-id"

async function main() {
  console.log("🔧 Local Dev: AI Provider Test\n")

  console.log("Environment:")
  console.log(`  AI_PROVIDER: ${process.env.AI_PROVIDER || "(not set, default: google)"}`)
  console.log(`  AI_MODEL: ${process.env.AI_MODEL || "(not set, using provider default)"}`)
  console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "✅ set" : "❌ not set"}`)
  console.log(`  GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "✅ set" : "❌ not set"}`)
  console.log("")

  console.log("1️⃣  Creating provider...")
  let provider
  try {
    provider = createProvider()
    console.log(`   ✅ Provider: ${provider.constructor.name}, model: ${provider.model}\n`)
  } catch (e: any) {
    console.log(`   ❌ ${e.message}\n`)
    process.exit(1)
  }

  console.log("2️⃣  Testing simple generation...")
  let rawText = ""
  try {
    rawText = await provider.generate({
      prompt: "Say hello as JSON: {\"message\": \"hello\"}",
      temperature: 0.1,
      jsonMode: true,
    })
    const cleaned = extractJson(rawText)
    const parsed = JSON.parse(cleaned)
    console.log(`   ✅ Response: ${JSON.stringify(parsed)}\n`)
  } catch (e: any) {
    console.log(`   ❌ ${e.message}`)
    console.log(`   Raw AI response (first 500 chars):\n${"─".repeat(60)}\n${rawText.slice(0, 500)}\n${"─".repeat(60)}`)
    console.log(`   Cleaned (first 500 chars):\n${"─".repeat(60)}\n${extractJson(rawText).slice(0, 500)}\n${"─".repeat(60)}`)
    process.exit(1)
  }

  console.log("3️⃣  Testing roadmap generation...")
  try {
    const prefs = await getDb().query.userPreferences.findFirst({
      where: eq(userPreferences.userId, USER_ID),
    })
    if (!prefs) {
      console.log("   ⏭️  No user preferences found (run onboarding first or create manually)")
    } else {
      const prompt = `You are a LeetCode coach creating a personalized study roadmap.

User Profile:
- Experience: ${prefs.experienceLevel}
- Goals: ${prefs.goals.join(", ")}
- Weak topics: ${prefs.weakTopics.join(", ")}
- Target companies: ${prefs.targetCompanies?.join(", ") || "Not specified"}
- Hours per week: ${prefs.hoursPerWeek}
- Target date: ${prefs.targetDate || "No deadline"}

Return a JSON array where each entry has: week (number), topic (string), description (string), problemsCount (number).
Aim for 4 weeks.`

      rawText = ""
      rawText = await provider.generate({ prompt, temperature: 0.7, jsonMode: true })
      const cleaned = extractJson(rawText)
      const parsed = JSON.parse(cleaned)
      const weeks = Array.isArray(parsed) ? parsed : parsed.weeks || parsed.roadmap || []
      console.log(`   ✅ Generated ${weeks.length} weeks`)
      weeks.forEach((w: any) => console.log(`      Week ${w.week}: ${w.topic}`))
    }
  } catch (e: any) {
    console.log(`   ❌ ${e.message}`)
    console.log(`   Raw AI response (first 500 chars):\n${"─".repeat(60)}\n${rawText.slice(0, 500)}\n${"─".repeat(60)}`)
    if (e.stack) console.log(`      Stack: ${e.stack.split("\n").slice(0, 3).join("\n      ")}`)
  }

  console.log("\n✅ Done")
}

main().catch((e) => {
  console.error("Fatal:", e)
  process.exit(1)
})
