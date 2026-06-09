import { z } from 'zod'

export const experienceEnum = z.enum(['beginner', 'intermediate', 'advanced', 'competitive'])

export const waitlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  leetcodeUsername: z.string().max(50).optional(),
  experience: experienceEnum,
  struggles: z.array(z.string()).optional(),
  desiredFeature: z.string().max(1000).optional(),
  goals: z.array(z.string()).optional(),
})

export const surveySchema = z.object({
  email: z.string().email(),
  struggles: z.array(z.string()).optional(),
  desiredFeature: z.string().max(1000).optional(),
  goals: z.array(z.string()).optional(),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
export type SurveyInput = z.infer<typeof surveySchema>
