import { motion } from 'framer-motion'
import { Code2, TrendingUp, Layers, Trophy } from 'lucide-react'

interface StatsData {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
}

const difficultyColors = {
  easy: { bg: 'bg-surface-600/30', text: 'text-surface-300', ring: 'stroke-surface-300' },
  medium: { bg: 'bg-surface-500/30', text: 'text-surface-200', ring: 'stroke-surface-200' },
  hard: { bg: 'bg-surface-700/30', text: 'text-surface-100', ring: 'stroke-surface-100' },
}

function RingProgress({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" className="transform -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgb(30 41 59)" strokeWidth="6" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="text-2xl font-bold text-surface-50">{value}</span>
      <span className="text-xs text-surface-400">{label}</span>
    </div>
  )
}

export function StatsCards({ stats }: { stats: StatsData }) {
  const items = [
    { icon: Code2, label: 'Total Solved', value: stats.totalSolved, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { icon: Layers, label: 'Easy', value: stats.easySolved, color: difficultyColors.easy.text, bg: difficultyColors.easy.bg },
    { icon: TrendingUp, label: 'Medium', value: stats.mediumSolved, color: difficultyColors.medium.text, bg: difficultyColors.medium.bg },
    { icon: Trophy, label: 'Hard', value: stats.hardSolved, color: difficultyColors.hard.text, bg: difficultyColors.hard.bg },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
          <div className="text-3xl font-bold text-surface-50 mb-1">{item.value}</div>
          <div className="text-sm text-surface-400">{item.label}</div>
        </motion.div>
      ))}

      <div className="md:col-span-4 glass-card p-6">
        <h3 className="text-sm font-medium text-surface-400 mb-6">Breakdown</h3>
        <div className="flex justify-around">
          <RingProgress value={stats.easySolved} max={stats.totalSolved || 1} color={difficultyColors.easy.ring} label="Easy" />
          <RingProgress value={stats.mediumSolved} max={stats.totalSolved || 1} color={difficultyColors.medium.ring} label="Medium" />
          <RingProgress value={stats.hardSolved} max={stats.totalSolved || 1} color={difficultyColors.hard.ring} label="Hard" />
        </div>
      </div>
    </div>
  )
}
