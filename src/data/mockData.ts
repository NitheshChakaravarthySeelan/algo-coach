export interface WaitlistEntry {
  id: string
  name: string
  email: string
  leetcodeUsername: string
  experience: 'beginner' | 'intermediate' | 'advanced' | 'competitive'
  struggles: string[]
  desiredFeature: string
  goals: string[]
  createdAt: string
}

export interface MonthlyProgress {
  month: string
  problems: number
  solved: number
}

export interface Activity {
  day: string
  completed: boolean
  count: number
}

export const mockProblems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', completed: true },
  { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks', completed: true },
  { id: 3, title: 'Merge Intervals', difficulty: 'Medium', topic: 'Intervals', completed: true },
  { id: 4, title: 'LRU Cache', difficulty: 'Medium', topic: 'Design', completed: false },
  { id: 5, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Dynamic Programming', completed: false },
  { id: 6, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Trees', completed: false },
]

export const mockDashboardData = {
  streak: 12,
  totalSolved: 147,
  weakTopics: ['Dynamic Programming', 'Graphs', 'Segment Trees'],
  completionRate: 95,
  monthlyProgress: [
    { month: 'Jan', problems: 45, solved: 40 },
    { month: 'Feb', problems: 52, solved: 48 },
    { month: 'Mar', problems: 38, solved: 35 },
    { month: 'Apr', problems: 61, solved: 58 },
    { month: 'May', problems: 55, solved: 52 },
    { month: 'Jun', problems: 48, solved: 46 },
  ] as MonthlyProgress[],
  dailyPlan: [
    { day: 'Mon', problems: ['Two Sum II', '3Sum', 'Container With Most Water'] },
    { day: 'Tue', problems: ['Binary Search', 'Search Rotated Array', 'Find Peak Element'] },
    { day: 'Wed', problems: ['Reverse Linked List', 'Merge Two Lists', 'LRU Cache'] },
  ],
  recentActivity: [
    { day: 'Today', completed: true, count: 3 },
    { day: 'Yesterday', completed: true, count: 2 },
    { day: '2 days ago', completed: true, count: 4 },
    { day: '3 days ago', completed: false, count: 0 },
    { day: '4 days ago', completed: true, count: 3 },
    { day: '5 days ago', completed: true, count: 5 },
    { day: '6 days ago', completed: true, count: 2 },
  ] as Activity[],
}

export const mockWaitlistData: WaitlistEntry[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    leetcodeUsername: 'alex_chen',
    experience: 'intermediate',
    struggles: ['Staying consistent', 'Finding good problems', 'Dynamic Programming'],
    desiredFeature: 'AI-powered problem recommendations that adapt to my skill level',
    goals: ['Job Interviews', 'FAANG Preparation'],
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    leetcodeUsername: 'sarah_codes',
    experience: 'beginner',
    struggles: ['Motivation', 'Finding good problems'],
    desiredFeature: 'A structured roadmap from beginner to advanced',
    goals: ['Job Interviews', 'General Problem Solving'],
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    name: 'Mike Liu',
    email: 'mike@example.com',
    leetcodeUsername: 'mikewins',
    experience: 'advanced',
    struggles: ['Contest preparation', 'Graphs'],
    desiredFeature: 'Weekly contest analysis and personalized improvement plan',
    goals: ['LeetCode Rating', 'Competitive Programming'],
    createdAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    name: 'Priya Patel',
    email: 'priya@example.com',
    leetcodeUsername: 'priya_p',
    experience: 'competitive',
    struggles: ['Finding good problems', 'Interview preparation'],
    desiredFeature: 'Company-specific problem sets with frequency analysis',
    goals: ['FAANG Preparation', 'Job Interviews'],
    createdAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james@example.com',
    leetcodeUsername: 'jwils',
    experience: 'intermediate',
    struggles: ['Staying consistent', 'Dynamic Programming', 'Graphs'],
    desiredFeature: 'Daily challenge streaks with social accountability',
    goals: ['General Problem Solving', 'Job Interviews'],
    createdAt: '2024-01-11T11:00:00Z',
  },
]

export const experienceDistribution = [
  { name: 'Beginner', value: 35, color: '#999999' },
  { name: 'Intermediate', value: 40, color: '#777777' },
  { name: 'Advanced', value: 18, color: '#555555' },
  { name: 'Competitive', value: 7, color: '#333333' },
]

export const painPointData = [
  { name: 'Staying Consistent', value: 78 },
  { name: 'Finding Good Problems', value: 65 },
  { name: 'Contest Preparation', value: 45 },
  { name: 'Interview Preparation', value: 55 },
  { name: 'Dynamic Programming', value: 70 },
  { name: 'Graphs', value: 50 },
  { name: 'Motivation', value: 60 },
]

export const goalDistribution = [
  { name: 'Job Interviews', value: 45, color: '#999999' },
  { name: 'LeetCode Rating', value: 20, color: '#777777' },
  { name: 'Competitive Programming', value: 15, color: '#555555' },
  { name: 'General Problem Solving', value: 10, color: '#444444' },
  { name: 'FAANG Preparation', value: 40, color: '#333333' },
]

export const requestedFeatures = [
  { name: 'AI Recommendations', value: 85 },
  { name: 'Daily Plans', value: 72 },
  { name: 'Company-specific Sets', value: 60 },
  { name: 'Contest Analysis', value: 55 },
  { name: 'Social Features', value: 48 },
  { name: 'Progress Tracking', value: 65 },
]

export const monthlySignups = [
  { month: 'Oct', signups: 45 },
  { month: 'Nov', signups: 78 },
  { month: 'Dec', signups: 112 },
  { month: 'Jan', signups: 156 },
  { month: 'Feb', signups: 198 },
  { month: 'Mar', signups: 245 },
]
