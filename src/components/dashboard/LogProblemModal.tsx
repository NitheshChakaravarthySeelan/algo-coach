import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface LogProblemModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const difficulties = ['Easy', 'Medium', 'Hard'] as const

export function LogProblemModal({ open, onClose, onSuccess }: LogProblemModalProps) {
  const [problemName, setProblemName] = useState('')
  const [difficulty, setDifficulty] = useState<typeof difficulties[number]>('Easy')
  const [topics, setTopics] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!problemName.trim()) return
    setLoading(true)
    setError('')

    try {
      await api.leetcode.log({
        problemId: problemName.toLowerCase().replace(/\s+/g, '-'),
        problemName: problemName.trim(),
        difficulty,
        topics: topics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })
      setProblemName('')
      setDifficulty('Easy')
      setTopics('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to log problem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-accent-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-50">Log Problem</h3>
                </div>
                <button onClick={onClose} className="text-surface-400 hover:text-surface-50 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-300">Problem Name</label>
                  <input
                    value={problemName}
                    onChange={(e) => setProblemName(e.target.value)}
                    placeholder="e.g. Two Sum"
                    required
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-300">Difficulty</label>
                  <div className="flex gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                          difficulty === d
                            ? 'bg-accent-600 text-white border-accent-500'
                            : 'bg-surface-800/50 text-surface-400 border-surface-700/50 hover:border-surface-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-300">
                    Topics <span className="text-surface-500">(comma separated)</span>
                  </label>
                  <input
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="e.g. Array, Hash Table, Two Pointers"
                    className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={onClose} type="button" className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !problemName.trim()} className="flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Logging...' : 'Log Problem'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
