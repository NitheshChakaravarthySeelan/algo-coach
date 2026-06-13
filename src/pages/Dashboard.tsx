import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, LogOut, RefreshCw, Plus, Loader2, Link2, GitBranch, Sun, Moon, Flame, History, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useSession } from '@/lib/use-session'
import { api } from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/Button'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ProblemList } from '@/components/dashboard/ProblemList'
import { LogProblemModal } from '@/components/dashboard/LogProblemModal'
import { TodaysPlan } from '@/components/dashboard/TodaysPlan'
import { RoadmapOverview } from '@/components/dashboard/RoadmapOverview'

export function Dashboard() {
  const navigate = useNavigate()
  const { data: session, isPending: authLoading } = useSession()
  const { theme, toggleTheme } = useTheme()

  const [checkingOnboard, setCheckingOnboard] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLogModal, setShowLogModal] = useState(false)
  const [linking, setLinking] = useState(false)
  const [lcUsername, setLcUsername] = useState('')
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; solvedToday: boolean } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [statsRes, problemsRes, streakRes, historyRes] = await Promise.all([
        api.leetcode.stats().catch(() => null),
        api.leetcode.listProblems().catch(() => ({ success: false, data: [] as any[] })),
        api.plan.streak().catch(() => null),
        api.plan.history().catch(() => ({ success: false, data: [] as any[] })),
      ])
      setStats(statsRes?.data ?? null)
      setProblems(problemsRes?.data ?? [])
      setStreak(streakRes?.data ?? null)
      setHistory(historyRes?.data ?? [])
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !session) navigate('/', { replace: true })
  }, [session, authLoading, navigate])

  useEffect(() => {
    if (!session) return
    api.onboard.status()
      .then((res: any) => {
        if (!res.onboarded) { navigate('/onboard', { replace: true }); return }
        setCheckingOnboard(false)
        loadData()
      })
      .catch(() => {
        navigate('/onboard', { replace: true })
      })
  }, [session])

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!lcUsername.trim()) return
    setLinking(true)
    try {
      await api.leetcode.link({ username: lcUsername.trim() })
      setLcUsername('')
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to link account')
    } finally {
      setLinking(false)
    }
  }

  if (authLoading || checkingOnboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-surface-950">
      <nav className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">AlgoCoach</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-surface-400 hover:text-white transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <span className="text-sm text-surface-400 hidden sm:block">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => authClient.signOut()}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {session.user.name || 'Coder'}
              </h1>
              <p className="text-surface-400 mt-1">Track your LeetCode progress</p>
            </div>
            {streak && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">{streak.currentStreak}</span>
                  <span className="text-xs text-surface-500">day streak</span>
                </div>
                <div className="text-xs text-surface-500">
                  Best: <span className="text-surface-300 font-medium">{streak.longestStreak}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
          </div>
        ) : stats ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Link2 className="w-4 h-4" />
                LeetCode: <span className="text-accent-400 font-medium">{stats.leetcodeUsername}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { loadData(); api.leetcode.refresh().catch(() => {}) }}>
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button size="sm" onClick={() => setShowLogModal(true)}>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Problem</span>
                </Button>
              </div>
            </div>

            <StatsCards stats={stats} />

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <TodaysPlan />
              </div>
              <div>
                <RoadmapOverview />
              </div>
            </div>

            <div className="mt-6">
              <ProblemList problems={problems} onRefresh={loadData} />
            </div>

            <div className="mt-6 glass-card p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-surface-400" />
                  <h3 className="text-lg font-semibold text-white">Solved History</h3>
                  <span className="text-xs text-surface-500">({history.length})</span>
                </div>
                {showHistory ? <ChevronDown className="w-4 h-4 text-surface-400" /> : <ChevronRight className="w-4 h-4 text-surface-400" />}
              </button>
              {showHistory && (
                <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-sm text-surface-500 text-center py-4">No solved problems yet. Start solving!</p>
                  ) : (
                    history.map((item: any, i: number) => (
                      <div key={`${item.titleSlug}-${i}`} className="flex items-center gap-3 p-3 bg-surface-800/20 rounded-lg">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          item.difficulty === 'Easy' ? 'bg-emerald-500' :
                          item.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={item.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-surface-300 hover:text-accent-400 transition-colors truncate"
                            >
                              {item.title}
                            </a>
                            <ExternalLink className="w-3 h-3 text-surface-500 shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${
                              item.difficulty === 'Easy' ? 'text-emerald-400' :
                              item.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                            }`}>{item.difficulty}</span>
                            <span className="text-surface-600">·</span>
                            <span className="text-xs text-surface-500">
                              {item.solvedDate ? new Date(item.solvedDate).toLocaleDateString() : 'Unknown date'}
                            </span>
                            <span className="text-surface-600">·</span>
                            <span className="text-xs text-surface-500">Week {item.weekNumber}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-12"
          >
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-6">
                <GitBranch className="w-8 h-8 text-accent-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Link Your LeetCode Profile</h2>
              <p className="text-sm text-surface-400 mb-6">
                Connect your LeetCode account to start tracking your progress and get personalized recommendations.
              </p>
              <form onSubmit={handleLink} className="space-y-4">
                <input
                  value={lcUsername}
                  onChange={(e) => setLcUsername(e.target.value)}
                  placeholder="Enter your LeetCode username"
                  required
                  className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50"
                />
                <Button type="submit" disabled={linking || !lcUsername.trim()} className="w-full">
                  {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {linking ? 'Verifying...' : 'Link Account'}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </main>

      <LogProblemModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
