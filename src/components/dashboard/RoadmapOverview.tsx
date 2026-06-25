import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Sparkles, RefreshCw, CheckCircle2, Trophy, AlertCircle, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

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
  ready: boolean
}

interface WeekProgress {
  week: number
  topic: string
  targetCount: number
  assignedCount: number
  solvedCount: number
  percent: number
}

export function RoadmapOverview() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [progress, setProgress] = useState<WeekProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [error, setError] = useState('')
  const [streamText, setStreamText] = useState('')
  const streamRef = useRef('')
  const genTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAll = useCallback(async () => {
    setError('')
    try {
      const res = await api.plan.roadmap()
      setRoadmap(res.data)
      if (!res.data.ready) {
        genTimeoutRef.current = setTimeout(() => generate(), 2000)
      }
      try {
        const pRes = await api.plan.roadmapProgress()
        if (pRes.success) setProgress(pRes.data)
      } catch {
        // progress returns 400 when roadmap hasn't been generated yet — expected
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load roadmap')
    }
  }, [])

  const fetchRoadmap = useCallback(() => {
    setLoading(true)
    fetchAll().finally(() => setLoading(false))
  }, [fetchAll])

  const generate = useCallback((force = false) => {
    setGenerating(true)
    setGenError('')
    setError('')
    setStreamText('')
    streamRef.current = ''

    api.plan.roadmapGenerate({
      onToken(text) {
        streamRef.current += text
        setStreamText(streamRef.current)
      },
      onDone(data) {
        setRoadmap(data)
        setGenerating(false)
        setStreamText('')
        api.plan.roadmapProgress().then((r) => { if (r.success) setProgress(r.data) }).catch(() => {})
      },
      onError(message) {
        setGenError(message)
        setGenerating(false)
        setStreamText('')
      },
    }, force).catch((err: any) => {
      setGenError(err.message || 'Generation failed')
      setGenerating(false)
      setStreamText('')
    })
  }, [])

  useEffect(() => {
    fetchRoadmap()
    return () => {
      if (genTimeoutRef.current) clearTimeout(genTimeoutRef.current)
    }
  }, [fetchRoadmap])

  useEffect(() => {
    const handler = () => { fetchAll() }
    window.addEventListener('algocoach:problem-solved', handler)
    return () => window.removeEventListener('algocoach:problem-solved', handler)
  }, [fetchAll])

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-surface-200">Your Roadmap</h3>
        </div>
        <div className="text-center py-8">
          {generating ? (
            <>
              <RefreshCw className="w-10 h-10 text-accent-400 mx-auto mb-3 animate-spin" />
              <p className="text-surface-400 text-sm mb-2">Generating your personalized roadmap...</p>
              {streamText && (
                <pre className="text-xs text-surface-500 text-left max-h-32 overflow-y-auto bg-surface-900/50 rounded-lg p-3 mx-auto max-w-md whitespace-pre-wrap">
                  {streamText}
                </pre>
              )}
            </>
          ) : genError ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-surface-400 text-sm mb-1">Generation failed</p>
              <p className="text-red-400 text-xs mb-5">{genError}</p>
              <Button onClick={() => generate()}>
                <Sparkles className="w-4 h-4" />
                Try Again
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-accent-400" />
              </div>
              <p className="text-surface-400 text-sm mb-1">No roadmap yet</p>
              <p className="text-surface-500 text-xs mb-5">
                Create a personalized study roadmap tailored to your goals
              </p>
              <Button onClick={() => generate()}>
                <Sparkles className="w-4 h-4" />
                Build Your Roadmap
              </Button>
            </>
          )}
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

  if (!roadmap.ready) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-surface-200">Your Roadmap</h3>
        </div>
        <div className="text-center py-8">
          {generating ? (
            <>
              <RefreshCw className="w-10 h-10 text-accent-400 mx-auto mb-3 animate-spin" />
              <p className="text-surface-400 text-sm mb-2">Generating your personalized roadmap...</p>
              {streamText && (
                <pre className="text-xs text-surface-500 text-left max-h-32 overflow-y-auto bg-surface-900/50 rounded-lg p-3 mx-auto max-w-md whitespace-pre-wrap">
                  {streamText}
                </pre>
              )}
            </>
          ) : (
            <>
              <Sparkles className="w-10 h-10 text-surface-500 mx-auto mb-3" />
              <p className="text-surface-400 text-sm mb-1">Roadmap not ready yet</p>
              {genError && <p className="text-red-400 text-xs mb-3">{genError}</p>}
              <Button onClick={() => generate()} disabled={generating}>
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Roadmap
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  const weeks = Array.isArray(roadmap.weeks) ? roadmap.weeks : []
  const weekProgressMap = new Map<number, WeekProgress>()
  for (const p of progress) weekProgressMap.set(p.week, p)

  const isFinished = roadmap.currentWeek > weeks.length

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-surface-200">Your Roadmap</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={fetchRoadmap} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button size="sm" onClick={() => generate(true)} disabled={generating}>
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline ml-1.5">Regenerate</span>
          </Button>
        </div>
      </div>

      {(error || genError) && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error || genError}</span>
        </div>
      )}

      {isFinished ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-surface-200 mb-1">Roadmap Complete!</h4>
          <p className="text-sm text-surface-400 mb-4">You've completed all weeks. Great work!</p>
          <Button onClick={() => generate(true)} disabled={generating}>
            <Sparkles className="w-4 h-4" />
            Generate New Roadmap
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {weeks.map((week, i) => {
            const isCurrent = week.week === roadmap.currentWeek
            const isPast = week.week < roadmap.currentWeek
            const wp = weekProgressMap.get(week.week)
            const solved = wp?.solvedCount ?? 0
            const total = wp?.targetCount ?? 0
            const pct = total > 0 ? Math.round((solved / total) * 100) : -1

            return (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-xl transition-colors ${
                  isCurrent ? 'bg-accent-500/10 border border-accent-500/20' :
                  isPast ? 'bg-surface-800/20 border border-transparent' :
                  'bg-surface-800/10 border border-transparent hover:bg-surface-800/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    pct >= 100 ? 'bg-emerald-600 text-white' :
                    isCurrent ? 'bg-accent-600 text-white' :
                    isPast ? 'bg-surface-700 text-surface-400' :
                    'bg-surface-800 text-surface-500'
                  }`}>
                    {pct >= 100 ? <CheckCircle2 className="w-4 h-4" /> : week.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-accent-300' : isPast ? 'text-surface-400' : 'text-surface-300'
                      }`}>
                        {week.topic}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-accent-500/20 rounded text-xs text-accent-400">Current</span>
                      )}
                      {pct >= 100 && isPast && (
                        <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 truncate">{week.description}</p>
                    {pct >= 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100 ? 'bg-emerald-500' : 'bg-accent-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-surface-500 shrink-0">
                          {solved}/{total}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-surface-500 shrink-0">{week.problemsCount}</div>
                  {isCurrent && <ChevronRight className="w-4 h-4 text-accent-400 shrink-0" />}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
