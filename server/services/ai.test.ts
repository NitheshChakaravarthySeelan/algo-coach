import { describe, test, expect } from "bun:test"
import { extractJson } from "./ai"

describe("extractJson", () => {
  test("extracts JSON object from chain-of-thought text", () => {
    const input = `Thought: I need to create a plan.
    {
      "weeks": [
        { "week": 1, "topic": "Arrays", "description": "Learn arrays", "problemsCount": 5 }
      ]
    }
    Some trailing text`
    expect(extractJson(input)).toBe(input.slice(input.indexOf("{")))
  })

  test("extracts JSON array from text", () => {
    const input = `Here is the roadmap:
    [
      { "week": 1, "topic": "Arrays", "description": "Learn arrays", "problemsCount": 5 }
    ]
    End.`
    expect(extractJson(input)).toBe(input.slice(input.indexOf("[")))
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

  test("extracts from nested JSON", () => {
    const input = `Background: user is beginner.
    {
      "problems": [
        { "title": "Two Sum", "titleSlug": "two-sum", "difficulty": "Easy", "topicTags": ["Array"], "leetcodeUrl": "https://leetcode.com/problems/two-sum/", "acRate": 57.6 }
      ],
      "explanation": "Start with Two Sum"
    }`
    const extracted = extractJson(input)
    expect(extracted.startsWith("{")).toBe(true)
    expect(() => JSON.parse(extracted)).not.toThrow()
    const parsed = JSON.parse(extracted)
    expect(parsed.problems).toBeDefined()
    expect(parsed.explanation).toBeDefined()
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
