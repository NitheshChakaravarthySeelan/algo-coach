import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Sparkles, ExternalLink, RefreshCw, CheckCircle2, RotateCw, Lightbulb, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface Problem {
  title: string
  titleSlug: string
  difficulty: string
  topicTags: string[]
  leetcodeUrl: string
  acRate: number
  status?: string
  completedAt?: string | null
}

interface PlanData {
  id: string
  date: string
  weekNumber: number
  topic: string
  problems: Problem[]
  explanation?: string
}

type DifficultyFilter = 'MIXED' | 'EASY' | 'MEDIUM' | 'HARD'

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Hard: 'text-red-400 bg-red-500/10',
}


export function TodaysPlan() {
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exists, setExists] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('MIXED')
  const [markingSlug, setMarkingSlug] = useState<string | null>(null)
  const [regeneratingSlot, setRegeneratingSlot] = useState<number | null>(null)
  const [easierSlug, setEasierSlug] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function fetchPlan() {
    setLoading(true)
    setError('')
    try {
      const res = await api.plan.today.get()
      if (res.exists && res.data) {
        setPlan(res.data)
        setExists(true)
      } else {
        setPlan(null)
        setExists(false)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load today\'s plan')
      setPlan(null)
      setExists(false)
    } finally {
      setLoading(false)
    }
  }

  async function generatePlan() {
    setGenerating(true)
    setError('')
    try {
      const res = await api.plan.today.generate(difficultyFilter)
      if (res.success) {
        setPlan(res.data)
        setExists(true)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  async function markProblem(slug: string, status: 'SOLVED' | 'TRIED' | 'SKIPPED' | 'PENDING') {
    if (!plan) return
    setMarkingSlug(slug)
    try {
      await api.plan.today.markProblem(plan.id, slug, status)
      setPlan((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          problems: prev.problems.map((p) =>
            p.titleSlug === slug
              ? { ...p, status, completedAt: status === 'SOLVED' ? new Date().toISOString() : null }
              : p,
          ),
        }
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to update problem status')
    } finally {
      setMarkingSlug(null)
    }
  }

  async function regenerateSlot(slot: number) {
    if (!plan) return
    setRegeneratingSlot(slot)
    setError('')
    try {
      const res = await api.plan.today.regenerate(plan.id, slot)
      if (res.success) {
        setPlan((prev) => {
          if (!prev) return prev
          return { ...prev, problems: res.data.problems }
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to replace problem')
    } finally {
      setRegeneratingSlot(null)
    }
  }

  async function onEasierProblem(slug: string, slot: number) {
    if (!plan) return
    setEasierSlug(slug)
    setError('')
    try {
      const res = await api.plan.today.regenerate(plan.id, slot, true)
      if (res.success) {
        setPlan((prev) => {
          if (!prev) return prev
          return { ...prev, problems: res.data.problems }
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to find easier problem')
    } finally {
      setEasierSlug(null)
    }
  }

  async function regenerateAll() {
    if (!plan) return
    setGenerating(true)
    setError('')
    try {
      const res = await api.plan.today.regenerate(plan.id)
      if (res.success) {
        setPlan((prev) => {
          if (!prev) return prev
          return { ...prev, problems: res.data.problems }
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to regenerate')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => { fetchPlan() }, [])

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
              <div className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <h3 className="text-lg font-semibold text-surface-200">Today's Plan</h3>
          </div>
          <DifficultySelector value={difficultyFilter} onChange={setDifficultyFilter} />
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-surface-400 text-sm mb-1">No plan for today yet</p>
          <p className="text-surface-500 text-xs mb-5">
            {difficultyFilter === 'MIXED'
              ? 'Get a curated set of 1 Easy + 1 Medium + 1 Hard problem'
              : `Get 3 ${difficultyFilter.toLowerCase()} problems to solve today`}
          </p>
          <Button onClick={generatePlan} disabled={generating}>
            {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <Sparkles className="w-4 h-4" />}
            Generate Today's Plan
          </Button>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const allSolved = plan.problems.every((p) => p.status === 'SOLVED')
  const solvedCount = plan.problems.filter((p) => p.status === 'SOLVED').length

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-400" />
          <div>
            <h3 className="text-lg font-semibold text-surface-200">Today's Plan</h3>
            <p className="text-xs text-surface-500">Week {plan.weekNumber} — {plan.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allSolved && plan.problems.length > 0 && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Done
            </span>
          )}
          <DifficultySelector value={difficultyFilter} onChange={setDifficultyFilter} />
          <Button variant="secondary" size="sm" onClick={fetchPlan} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={regenerateAll} disabled={generating}>
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline ml-1.5">Regenerate</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {plan.explanation && (
        <p className="text-sm text-surface-400 mb-4">{plan.explanation}</p>
      )}

      <div className="space-y-3">
        {plan.problems.map((problem, i) => {
          const status = problem.status || 'PENDING'
          const isMarking = markingSlug === problem.titleSlug
          const isRegenerating = regeneratingSlot === i

          return (
            <motion.div
              key={problem.titleSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border transition-colors ${
                status === 'SOLVED'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : status === 'SKIPPED'
                    ? 'bg-surface-800/20 border-surface-700/30 opacity-60'
                    : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    onClick={() => markProblem(problem.titleSlug, status === 'SOLVED' ? 'PENDING' : 'SOLVED')}
                    disabled={isMarking}
                    className="transition-transform hover:scale-110"
                    title="Toggle solved"
                  >
                    {isMarking ? (
                      <RefreshCw className="w-5 h-5 text-accent-400 animate-spin" />
                    ) : status === 'SOLVED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-surface-600 hover:border-emerald-500" />
                    )}
                  </button>
                  <button
                    onClick={() => regenerateSlot(i)}
                    disabled={isRegenerating}
                    className="text-surface-600 hover:text-accent-400 transition-colors"
                    title="Replace this problem"
                  >
                    {isRegenerating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCw className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={problem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-surface-200 hover:text-accent-400 transition-colors"
                    >
                      {problem.title}
                    </a>
                    <a
                      href={`${problem.leetcodeUrl}solutions/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-500 hover:text-accent-400 transition-colors"
                      title="View solution"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={problem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-500 hover:text-accent-400 transition-colors"
                      title="Open in LeetCode"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[problem.difficulty] || 'text-surface-400 bg-surface-800'}`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-surface-500">
                      {Math.round(problem.acRate)}% AC
                    </span>
                    {problem.topicTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-surface-800 rounded text-xs text-surface-400">
                        {tag}
                      </span>
                    ))}
                    {status !== 'PENDING' && status !== 'SOLVED' && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        status === 'TRIED' ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-700/50 text-surface-400'
                      }`}>
                        {status === 'TRIED' ? 'Tried' : 'Skipped'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  {status !== 'SOLVED' && (
                    <button
                      onClick={() => markProblem(problem.titleSlug, 'SOLVED')}
                      disabled={isMarking}
                      className="px-2 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      Solved
                    </button>
                  )}
                  {status === 'PENDING' && (
                    <button
                      onClick={() => markProblem(problem.titleSlug, 'TRIED')}
                      disabled={isMarking}
                      className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                    >
                      Tried
                    </button>
                  )}
                  {status === 'PENDING' && (
                    <button
                      onClick={() => markProblem(problem.titleSlug, 'SKIPPED')}
                      disabled={isMarking}
                      className="px-2 py-1 text-xs rounded-lg bg-surface-700/50 text-surface-400 hover:bg-surface-700 transition-colors disabled:opacity-50"
                    >
                      Skip
                    </button>
                  )}
                  {status === 'TRIED' && (
                    <button
                      onClick={() => onEasierProblem(problem.titleSlug, i)}
                      disabled={easierSlug === problem.titleSlug}
                      className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                    >
                      {easierSlug === problem.titleSlug ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'I\'m stuck'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {plan.problems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-surface-700/30 flex items-center justify-between text-xs text-surface-500">
          <span>{solvedCount} / {plan.problems.length} solved</span>
          {allSolved && <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All done!</span>}
        </div>
      )}
    </div>
  )
}

function DifficultySelector({ value, onChange }: { value: DifficultyFilter; onChange: (v: DifficultyFilter) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DifficultyFilter)}
      className="text-xs bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-surface-300 focus:outline-none focus:border-accent-500/50"
    >
      <option value="MIXED">Mixed</option>
      <option value="EASY">Easy</option>
      <option value="MEDIUM">Medium</option>
      <option value="HARD">Hard</option>
    </select>
  )
}
