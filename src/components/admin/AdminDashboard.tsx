import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Target, BarChart3, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const COLORS = ['#6366f1', '#a78bfa', '#818cf8', '#6366f1', '#4f46e5', '#4338ca']

export function AdminDashboard() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.survey.list()
      .then((res) => setEntries(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const experienceDist = ['beginner', 'intermediate', 'advanced', 'competitive'].map((level, i) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: entries.filter((e) => e.experience === level).length,
    color: COLORS[i],
  }))

  const painPointMap = new Map<string, number>()
  for (const e of entries) {
    const struggles = Array.isArray(e.struggles) ? e.struggles : []
    for (const s of struggles) painPointMap.set(s, (painPointMap.get(s) || 0) + 1)
  }
  const painPoints = [...painPointMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const goalMap = new Map<string, number>()
  for (const e of entries) {
    const goals = Array.isArray(e.goals) ? e.goals : []
    for (const g of goals) goalMap.set(g, (goalMap.get(g) || 0) + 1)
  }
  const goalDist = [...goalMap.entries()]
    .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.value - a.value)

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-50">Admin Analytics</h1>
              <div className="px-2.5 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-xs text-accent-400">
                Live
              </div>
            </div>
            <p className="text-surface-400">Onboarding data and user insights</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-2" onClick={() => {
            const csv = [['Name', 'Email', 'LeetCode', 'Level', 'Goals', 'Struggles', 'Date'].join(','),
              ...entries.map((e: any) => [e.name || '', e.email || '', e.leetcodeUsername || '', e.experience || '',
                (Array.isArray(e.goals) ? e.goals.join(';') : ''),
                (Array.isArray(e.struggles) ? e.struggles.join(';') : ''),
                e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''
              ].join(','))
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'algocoach-survey-data.csv'; a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-50">{entries.length}</div>
                <div className="text-xs text-surface-400">Total Signups</div>
              </div>
            </div>
            <div className="text-xs text-surface-400">All time</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-50">{experienceDist.reduce((a, b) => a + b.value, 0) > 0 ? `${Math.round(experienceDist.filter(e => e.name !== 'Beginner').reduce((a, b) => a + b.value, 0) / Math.max(1, experienceDist.reduce((a, b) => a + b.value, 0)) * 100)}%` : 'N/A'}</div>
                <div className="text-xs text-surface-400">Intermediate+</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Experience level</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-50">{painPoints.length}</div>
                <div className="text-xs text-surface-400">Pain Points</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Identified</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-600/30 border border-surface-500/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-surface-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-surface-50">{goalDist.length}</div>
                <div className="text-xs text-surface-400">Goal Categories</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Tracked</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-surface-300 mb-1">Signups Over Time</h3>
            <p className="text-xs text-surface-500 mb-4">Total: {entries.length} entries</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(() => {
                  const months: Record<string, number> = {}
                  for (const e of entries) {
                    const m = e.createdAt ? new Date(e.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' }) : 'Unknown'
                    months[m] = (months[m] || 0) + 1
                  }
                  return Object.entries(months).map(([month, count]) => ({ month, signups: count }))
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" />
                  <XAxis dataKey="month" stroke="#4a5678" fontSize={12} />
                  <YAxis stroke="#4a5678" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131826', border: '1px solid #37415c', borderRadius: '12px' }} labelStyle={{ color: '#e2e6f0' }} />
                  <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-surface-300 mb-1">Experience Level Distribution</h3>
            <p className="text-xs text-surface-500 mb-4">How users rate themselves</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={experienceDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {experienceDist.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#131826', border: '1px solid #37415c', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {experienceDist.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-surface-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {painPoints.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-surface-300 mb-1">Most Common Pain Points</h3>
              <p className="text-xs text-surface-500 mb-4">What users struggle with most</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={painPoints.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" horizontal={false} />
                    <XAxis type="number" stroke="#4a5678" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#4a5678" fontSize={12} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#131826', border: '1px solid #37415c', borderRadius: '12px' }} labelStyle={{ color: '#e2e6f0' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-surface-300 mb-1">Goal Distribution</h3>
              <p className="text-xs text-surface-500 mb-4">What users are optimizing for</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={goalDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {goalDist.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#131826', border: '1px solid #37415c', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {goalDist.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-surface-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-surface-300 mb-4">
            Recent Signups {entries.length > 0 && <span className="text-surface-500 font-normal">({entries.length} total)</span>}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">LeetCode</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Level</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Goals</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 px-3 text-surface-300">{entry.email}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-accent-400 text-xs">{entry.leetcodeUsername || '-'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-surface-300">{entry.experience || '-'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {(Array.isArray(entry.goals) ? entry.goals : []).map((g: string) => (
                          <span key={g} className="px-2 py-0.5 bg-accent-500/10 text-accent-400 rounded text-xs">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-surface-400 text-xs">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}