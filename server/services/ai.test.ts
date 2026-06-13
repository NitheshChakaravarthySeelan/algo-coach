import { describe, test, expect } from "bun:test"
import { extractJson } from "./ai-provider"

describe("extractJson", () => {
  test("extracts JSON object from end of chain-of-thought text", () => {
    const input = `*   Input: something
    *   Constraint: some rules
    *   The JSON: \`{"message": "hello"}\`{"message": "hello"}`
    const parsed = JSON.parse(extractJson(input))
    expect(parsed.message).toBe("hello")
  })

  test("extracts JSON array from end of text", () => {
    const input = `Here is the roadmap:
    [
      { "week": 1, "topic": "Arrays", "description": "Learn arrays", "problemsCount": 5 }
    ]
    End.`
    const extracted = extractJson(input)
    expect(() => JSON.parse(extracted)).not.toThrow()
    expect(JSON.parse(extracted)[0].week).toBe(1)
  })

  test("returns original text if no JSON found", () => {
    const input = "Just plain text without any JSON"
    expect(extractJson(input)).toBe(input)
  })

  test("handles clean JSON input", () => {
    const input = `{"key": "value"}`
    expect(extractJson(input)).toBe(input)
  })

  test("handles empty string", () => {
    expect(extractJson("")).toBe("")
  })

  test("extracts JSON with trailing backticks", () => {
    const input = "```json\n{\"key\": \"value\"}\n```"
    const parsed = JSON.parse(extractJson(input))
    expect(parsed.key).toBe("value")
  })

  test("extracts JSON from markdown code blocks", () => {
    const input = "```json\n[{\"week\":1,\"topic\":\"Arrays\"}]\n```"
    const parsed = JSON.parse(extractJson(input))
    expect(parsed[0].topic).toBe("Arrays")
  })

  test("picks the LAST JSON object when multiple exist", () => {
    const input = `Some text {"first": "one"} more text {"second": "two"}`
    const parsed = JSON.parse(extractJson(input))
    expect(parsed.second).toBe("two")
  })

  test("picks the LAST JSON array when multiple exist", () => {
    const input = `first [1, 2] second [3, 4]`
    const parsed = JSON.parse(extractJson(input))
    expect(parsed).toEqual([3, 4])
  })
})
