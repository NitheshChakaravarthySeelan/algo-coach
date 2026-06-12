import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Sparkles, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'

interface Problem {
  title: string
  titleSlug: string
  difficulty: string
  topicTags: string[]
  leetcodeUrl: string
  acRate: number
}

interface PlanData {
  id: string
  date: string
  weekNumber: number
  topic: string
  problems: Problem[]
  explanation?: string
}

export function TodaysPlan() {
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exists, setExists] = useState(false)

  async function fetchPlan() {
    setLoading(true)
    try {
      const res = await api.plan.today.get()
      if (res.exists && res.data) {
        setPlan(res.data)
        setExists(true)
      } else {
        setPlan(null)
        setExists(false)
      }
    } catch {
      setPlan(null)
      setExists(false)
    } finally {
      setLoading(false)
    }
  }

  async function generatePlan() {
    setGenerating(true)
    try {
      const res = await api.plan.today.generate()
      if (res.success) {
        setPlan(res.data)
        setExists(true)
      }
    } catch {
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => { fetchPlan() }, [])

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!exists || !plan) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Today's Plan</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 text-sm mb-1">No plan for today yet</p>
          <p className="text-surface-500 text-xs mb-4">Generate a personalized plan based on your roadmap</p>
          <Button onClick={generatePlan} disabled={generating}>
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Today\'s Plan'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Today's Plan</h3>
            <p className="text-xs text-surface-500">Week {plan.weekNumber} — {plan.topic}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchPlan} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={generatePlan} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline ml-1.5">Regenerate</span>
          </Button>
        </div>
      </div>

      {plan.explanation && (
        <p className="text-sm text-surface-400 mb-4">{plan.explanation}</p>
      )}

      <div className="space-y-3">
        {plan.problems.map((problem, i) => (
          <motion.div
            key={problem.titleSlug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 bg-surface-800/30 rounded-xl border border-surface-700/30 hover:border-surface-600/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center text-xs font-bold text-accent-400 shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white hover:text-accent-400 transition-colors flex items-center gap-1.5"
              >
                {problem.title}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'text-surface-300' :
                  problem.difficulty === 'Medium' ? 'text-surface-200' :
                  'text-surface-100'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="text-surface-600">·</span>
                <span className="text-xs text-surface-500">{Math.round(problem.acRate)}% acceptance</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
              {problem.topicTags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-surface-800 rounded text-xs text-surface-400">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 text-surface-500 hover:text-accent-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
