const LEETCODE_API = "https://leetcode.com/graphql";

interface LeetCodeProblem {
  title: string
  titleSlug: string
  difficulty: "Easy" | "Medium" | "Hard"
  frontendQuestionId: string
  topicTags: { name: string; slug: string }[]
  acRate: number
  paidOnly: boolean
}

interface LeetCodeSearchResult {
  problemsetQuestionList: {
    total: number
    questions: LeetCodeProblem[]
  }
}

const searchQuery = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        frontendQuestionId: questionFrontendId
        paidOnly: isPaidOnly
        title
        titleSlug
        topicTags {
          name
          slug
        }
      }
    }
  }
`;

export async function searchLeetCodeProblems(params: {
  topics?: string[]
  difficulty?: "EASY" | "MEDIUM" | "HARD"
  limit?: number
  excludeSlugs?: string[]
}): Promise<LeetCodeProblem[]> {
  const { topics, difficulty, limit = 15, excludeSlugs = [] } = params

  const filters: Record<string, unknown> = {}
  if (topics?.length) filters.tags = topics
  if (difficulty) filters.difficulty = difficulty

  const res = await fetch(LEETCODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        categorySlug: "",
        limit: limit + excludeSlugs.length,
        skip: 0,
        filters,
      },
    }),
  })

  const json = await res.json() as { data?: LeetCodeSearchResult; errors?: { message: string }[] }
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "LeetCode search API error")
  }

  let problems = json.data?.problemsetQuestionList?.questions || []
  problems = problems.filter((p) => !p.paidOnly)

  if (excludeSlugs.length) {
    problems = problems.filter((p) => !excludeSlugs.includes(p.titleSlug))
  }

  return problems.slice(0, limit)
}
