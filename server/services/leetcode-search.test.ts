import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { searchLeetCodeProblems } from "./leetcode-search"

const MOCK_SUCCESS = {
  data: {
    problemsetQuestionList: {
      total: 5,
      questions: [
        { acRate: 57.6, difficulty: "Easy", frontendQuestionId: "1", paidOnly: false, title: "Two Sum", titleSlug: "two-sum", topicTags: [{ name: "Array", slug: "array" }] },
        { acRate: 47.7, difficulty: "Easy", frontendQuestionId: "14", paidOnly: false, title: "Longest Common Prefix", titleSlug: "longest-common-prefix", topicTags: [{ name: "Array", slug: "array" }] },
        { acRate: 41.1, difficulty: "Medium", frontendQuestionId: "322", paidOnly: false, title: "Coin Change", titleSlug: "coin-change", topicTags: [{ name: "Dynamic Programming", slug: "dynamic-programming" }] },
        { acRate: 31.2, difficulty: "Medium", frontendQuestionId: "5", paidOnly: false, title: "Longest Palindromic Substring", titleSlug: "longest-palindromic-substring", topicTags: [{ name: "String", slug: "string" }] },
        { acRate: 60.0, difficulty: "Hard", frontendQuestionId: "100", paidOnly: true, title: "Paid Problem", titleSlug: "paid-problem", topicTags: [] },
      ],
    },
  },
}

const originalFetch = globalThis.fetch

describe("searchLeetCodeProblems", () => {
  afterAll(() => { globalThis.fetch = originalFetch })

  test("returns problems matching topic and difficulty", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve(MOCK_SUCCESS) } as Response)
    const problems = await searchLeetCodeProblems({ topics: ["array"], difficulty: "EASY" })
    expect(problems.length).toBeGreaterThan(0)
    expect(problems[0]).toHaveProperty("title")
    expect(problems[0]).toHaveProperty("titleSlug")
    expect(problems[0]).toHaveProperty("difficulty")
    expect(problems[0]).toHaveProperty("acRate")
    expect(problems[0]).toHaveProperty("topicTags")
    expect(Array.isArray(problems[0].topicTags)).toBe(true)
  })

  test("filters out paid-only problems", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve(MOCK_SUCCESS) } as Response)
    const problems = await searchLeetCodeProblems({})
    const paidSlugs = problems.filter(p => MOCK_SUCCESS.data.problemsetQuestionList.questions.find(q => q.titleSlug === p.titleSlug)?.paidOnly)
    expect(paidSlugs.length).toBe(0)
  })

  test("excludes specified slugs", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve(MOCK_SUCCESS) } as Response)
    const problems = await searchLeetCodeProblems({ excludeSlugs: ["two-sum"], limit: 10 })
    expect(problems.some(p => p.titleSlug === "two-sum")).toBe(false)
  })

  test("throws on API errors", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve({ errors: [{ message: "Rate limited" }] }) } as Response)
    expect(searchLeetCodeProblems({})).rejects.toThrow("Rate limited")
  })

  test("returns empty array when no results", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve({ data: { problemsetQuestionList: { total: 0, questions: [] } } }) } as Response)
    const problems = await searchLeetCodeProblems({})
    expect(problems).toEqual([])
  })

  test("respects the limit parameter", async () => {
    const manyResults = {
      data: {
        problemsetQuestionList: {
          total: 20,
          questions: Array.from({ length: 20 }, (_, i) => ({
            acRate: 50, difficulty: "Easy", frontendQuestionId: String(i + 1), isPaidOnly: false,
            title: `Problem ${i + 1}`, titleSlug: `problem-${i + 1}`, topicTags: [],
          })),
        },
      },
    }
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve(manyResults) } as Response)
    const problems = await searchLeetCodeProblems({ limit: 5 })
    expect(problems.length).toBe(5)
  })

  test("real API: returns real problems", async () => {
    globalThis.fetch = originalFetch
    const problems = await searchLeetCodeProblems({ topics: ["array"], limit: 2 })
    expect(problems.length).toBeGreaterThan(0)
    expect(problems[0].title).toBeTruthy()
    expect(problems[0].titleSlug).toBeTruthy()
    expect(["Easy", "Medium", "Hard"]).toContain(problems[0].difficulty)
  }, { timeout: 15000 })
})
