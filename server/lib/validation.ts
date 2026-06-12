import { z } from 'zod'

export const experienceEnum = z.enum(['beginner', 'intermediate', 'advanced', 'competitive'])

export const surveySchema = z.object({
  email: z.string().email(),
  struggles: z.array(z.string()).optional(),
  desiredFeature: z.string().max(1000).optional(),
  goals: z.array(z.string()).optional(),
})

export const linkLeetcodeSchema = z.object({
  leetcodeUsername: z.string().min(1, 'LeetCode username is required').max(50),
})

export const logProblemSchema = z.object({
  problemId: z.string().min(1),
  problemName: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topics: z.array(z.string()).default([]),
})

export type SurveyInput = z.infer<typeof surveySchema>
export type LinkLeetcodeInput = z.infer<typeof linkLeetcodeSchema>
export type LogProblemInput = z.infer<typeof logProblemSchema>
