import { describe, test, expect } from "bun:test"
import { surveySchema, linkLeetcodeSchema, logProblemSchema } from "./validation"

describe("surveySchema", () => {
  test("accepts valid survey", () => {
    const result = surveySchema.parse({ email: "test@example.com" })
    expect(result.email).toBe("test@example.com")
  })

  test("accepts survey with all fields", () => {
    const result = surveySchema.parse({
      email: "test@example.com",
      struggles: ["consistency", "dp"],
      desiredFeature: "more problems",
      goals: ["faang"],
    })
    expect(result.struggles).toEqual(["consistency", "dp"])
    expect(result.desiredFeature).toBe("more problems")
    expect(result.goals).toEqual(["faang"])
  })

  test("rejects invalid email", () => {
    expect(() => surveySchema.parse({ email: "not-an-email" })).toThrow()
  })

  test("rejects empty email", () => {
    expect(() => surveySchema.parse({ email: "" })).toThrow()
  })

  test("defaults optional fields when omitted", () => {
    const result = surveySchema.parse({ email: "test@example.com" })
    expect(result.struggles).toBeUndefined()
    expect(result.desiredFeature).toBeUndefined()
    expect(result.goals).toBeUndefined()
  })
})

describe("linkLeetcodeSchema", () => {
  test("accepts valid username", () => {
    const result = linkLeetcodeSchema.parse({ leetcodeUsername: "neetcode" })
    expect(result.leetcodeUsername).toBe("neetcode")
  })

  test("rejects empty username", () => {
    expect(() => linkLeetcodeSchema.parse({ leetcodeUsername: "" })).toThrow()
  })

  test("accepts username with numbers", () => {
    const result = linkLeetcodeSchema.parse({ leetcodeUsername: "user123" })
    expect(result.leetcodeUsername).toBe("user123")
  })
})

describe("logProblemSchema", () => {
  test("accepts valid log entry", () => {
    const result = logProblemSchema.parse({
      problemId: "two-sum",
      problemName: "Two Sum",
      difficulty: "Medium",
    })
    expect(result.problemId).toBe("two-sum")
    expect(result.difficulty).toBe("Medium")
    expect(result.topics).toEqual([])
  })

  test("accepts log entry with topics", () => {
    const result = logProblemSchema.parse({
      problemId: "two-sum",
      problemName: "Two Sum",
      difficulty: "Easy",
      topics: ["array", "hash-table"],
    })
    expect(result.topics).toEqual(["array", "hash-table"])
  })

  test("rejects invalid difficulty", () => {
    expect(() => logProblemSchema.parse({
      problemId: "test",
      problemName: "Test",
      difficulty: "SuperHard",
    })).toThrow()
  })

  test("rejects empty problemId", () => {
    expect(() => logProblemSchema.parse({
      problemId: "",
      problemName: "Test",
      difficulty: "Easy",
    })).toThrow()
  })
})
