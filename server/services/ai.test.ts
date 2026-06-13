import { describe, test, expect } from "bun:test"
import { extractJson } from "./ai-provider"

describe("extractJson", () => {
  test("extracts JSON object stripping trailing text", () => {
    const input = `Thought: I need to create a plan.
    {
      "weeks": [
        { "week": 1, "topic": "Arrays", "description": "Learn arrays", "problemsCount": 5 }
      ]
    }
    Some trailing text`
    const extracted = extractJson(input)
    expect(() => JSON.parse(extracted)).not.toThrow()
    const parsed = JSON.parse(extracted)
    expect(parsed.weeks).toBeDefined()
    expect(parsed.weeks[0].week).toBe(1)
  })

  test("extracts JSON array stripping trailing text", () => {
    const input = `Here is the roadmap:
    [
      { "week": 1, "topic": "Arrays", "description": "Learn arrays", "problemsCount": 5 }
    ]
    End.`
    const extracted = extractJson(input)
    expect(() => JSON.parse(extracted)).not.toThrow()
    const parsed = JSON.parse(extracted)
    expect(parsed[0].week).toBe(1)
  })

  test("returns original text if no JSON found", () => {
    const input = "Just plain text without any JSON"
    expect(extractJson(input)).toBe(input)
  })

  test("extracts from text starting with JSON", () => {
    const input = `{"key": "value"}`
    expect(extractJson(input)).toBe(input)
  })

  test("handles empty string", () => {
    expect(extractJson("")).toBe("")
  })

  test("extracts from nested JSON with trailing backticks", () => {
    const input = `\`\`\`json
    {
      "problems": [
        { "title": "Two Sum", "titleSlug": "two-sum", "difficulty": "Easy", "topicTags": ["Array"], "leetcodeUrl": "https://leetcode.com/problems/two-sum/", "acRate": 57.6 }
      ],
      "explanation": "Start with Two Sum"
    }
    \`\`\``
    const extracted = extractJson(input)
    expect(() => JSON.parse(extracted)).not.toThrow()
    const parsed = JSON.parse(extracted)
    expect(parsed.problems).toBeDefined()
    expect(parsed.explanation).toBe("Start with Two Sum")
  })

  test("extracts JSON from markdown code blocks", () => {
    const input = "```json\n[{\"week\":1,\"topic\":\"Arrays\"}]\n```"
    const extracted = extractJson(input)
    expect(() => JSON.parse(extracted)).not.toThrow()
    expect(JSON.parse(extracted)[0].topic).toBe("Arrays")
  })

  test("prefers object over array when both present", () => {
    const input = `some text { "a": 1 } more [1, 2, 3]`
    const result = extractJson(input)
    expect(result.startsWith("{")).toBe(true)
  })

  test("prefers array when it comes first", () => {
    const input = `some text [1, 2, 3] more { "a": 1 }`
    const result = extractJson(input)
    expect(result.startsWith("[")).toBe(true)
  })
})
