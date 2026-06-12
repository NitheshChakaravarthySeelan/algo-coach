import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface RoadmapWeek {
  week: number
  topic: string
  description: string
  problemsCount: number
}

interface RoadmapData {
  id: string
  weeks: RoadmapWeek[]
  currentWeek: number
}

export function RoadmapOverview() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.plan.roadmap()
      .then((res) => setRoadmap(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!roadmap) return null

  const weeks = Array.isArray(roadmap.weeks) ? roadmap.weeks : []

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-accent-400" />
        <h3 className="text-lg font-semibold text-white">Your Roadmap</h3>
      </div>
      <div className="space-y-2">
        {weeks.map((week, i) => {
          const isCurrent = week.week === roadmap.currentWeek
          const isPast = week.week < roadmap.currentWeek
          return (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isCurrent ? 'bg-accent-500/10 border border-accent-500/20' :
                isPast ? 'bg-surface-800/20 border border-transparent' :
                'bg-surface-800/10 border border-transparent hover:bg-surface-800/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isCurrent ? 'bg-accent-600 text-white' :
                isPast ? 'bg-surface-700 text-surface-400' :
                'bg-surface-800 text-surface-500'
              }`}>
                {week.week}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-accent-300' : isPast ? 'text-surface-400' : 'text-surface-300'
                  }`}>
                    {week.topic}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-accent-500/20 rounded text-xs text-accent-400">Current</span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5 truncate">{week.description}</p>
              </div>
              <div className="text-xs text-surface-500 shrink-0">{week.problemsCount} problems</div>
              {isCurrent && <ChevronRight className="w-4 h-4 text-accent-400 shrink-0" />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
