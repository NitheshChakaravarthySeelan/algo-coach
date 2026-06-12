import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Search, Filter, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface Problem {
  id: string
  problemId: string
  problemName: string
  difficulty: string
  topics: string[]
  status: string
  date: string
}

const difficultyBadge = {
  Easy: 'success' as const,
  Medium: 'warning' as const,
  Hard: 'info' as const,
}

export function ProblemList({ problems, onRefresh }: { problems: Problem[]; onRefresh?: () => void }) {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'SOLVED'>('ALL')
  const [search, setSearch] = useState('')
  const [solvingId, setSolvingId] = useState<string | null>(null)

  async function handleMarkSolved(problem: Problem) {
    if (problem.status === 'SOLVED' || solvingId) return
    setSolvingId(problem.problemId)
    try {
      await api.leetcode.markSolved(problem.problemId)
      onRefresh?.()
    } catch {
    } finally {
      setSolvingId(null)
    }
  }

  const filtered = problems
    .filter((p) => filter === 'ALL' || p.status === filter)
    .filter((p) => p.problemName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Problem Log</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50"
            />
          </div>
          <div className="flex gap-1 bg-surface-800/50 rounded-xl p-1">
            {(['ALL', 'IN_PROGRESS', 'SOLVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === f ? 'bg-accent-600 text-white' : 'text-surface-400 hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'Active' : 'Solved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">No problems logged yet</p>
          <p className="text-surface-500 text-xs mt-1">Click "Log Problem" to track your progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 bg-surface-800/30 rounded-xl border border-surface-700/30 hover:border-surface-700/60 transition-colors"
            >
              <button
                onClick={() => handleMarkSolved(problem)}
                disabled={problem.status === 'SOLVED' || solvingId === problem.problemId}
                className="shrink-0 focus:outline-none"
                title={problem.status === 'SOLVED' ? 'Already solved' : 'Mark as solved'}
              >
                {solvingId === problem.problemId ? (
                  <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                ) : problem.status === 'SOLVED' ? (
                  <CheckCircle2 className="w-5 h-5 text-surface-400" />
                ) : (
                  <Circle className="w-5 h-5 text-surface-500 hover:text-accent-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{problem.problemName}</p>
                <p className="text-xs text-surface-500 mt-0.5">
                  {new Date(problem.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {problem.topics?.slice(0, 2).map((t: string) => (
                  <Badge key={t} variant="default">{t}</Badge>
                ))}
                <Badge variant={difficultyBadge[problem.difficulty as keyof typeof difficultyBadge] || 'default'}>
                  {problem.difficulty}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
