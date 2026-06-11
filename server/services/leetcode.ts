const LEETCODE_API = "https://leetcode.com/graphql";

const getLeetcodeDataQuery = `
  query GetLeetCodeProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
    }
  }
`;

export interface LeetCodeStats {
  username: string
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  rating: number | null
  ranking: number | null
}

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(LEETCODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json() as { data: T; errors?: { message: string }[] }
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "LeetCode API error")
  }
  return json.data
}

export async function validateUsername(username: string): Promise<boolean> {
  try {
    const data = await graphqlRequest<{ matchedUser: { username: string } | null }>(
      `query ($username: String!) { matchedUser(username: $username) { username } }`,
      { username },
    )
    return data.matchedUser !== null
  } catch {
    return false
  }
}

export async function fetchLeetcodeStats(username: string): Promise<LeetCodeStats> {
  const valid = await validateUsername(username)
  if (!valid) throw new Error("LeetCode username not found")

  const data = await graphqlRequest<{
    matchedUser: {
      username: string
      submitStats: {
        acSubmissionNum: { difficulty: string; count: number }[]
      }
    }
    userContestRanking: { rating: number; globalRanking: number } | null
  }>(getLeetcodeDataQuery, { username })

  const counts: Record<string, number> = {}
  for (const entry of data.matchedUser.submitStats.acSubmissionNum) {
    counts[entry.difficulty.toLowerCase()] = entry.count
  }

  return {
    username: data.matchedUser.username,
    totalSolved: counts.all || 0,
    easySolved: counts.easy || 0,
    mediumSolved: counts.medium || 0,
    hardSolved: counts.hard || 0,
    rating: data.userContestRanking?.rating ?? null,
    ranking: data.userContestRanking?.globalRanking ?? null,
  }
}
