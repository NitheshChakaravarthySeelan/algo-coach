import { motion } from 'framer-motion'
import { Flame, CheckCircle, Target, TrendingUp } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { mockDashboardData } from '@/data/mockData'

export function DashboardPreview() {
  const { streak, totalSolved, weakTopics, completionRate, monthlyProgress, dailyPlan, recentActivity } = mockDashboardData

  return (
    <section className="py-24 relative" id="dashboard">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 via-transparent to-surface-900/50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Your personal{' '}
            <span className="gradient-text">command center</span>
          </h2>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto">
            Everything you need to track, plan, and level up your LeetCode journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-1">
            <div className="bg-surface-900/80 rounded-2xl overflow-hidden">
              {/* Window controls */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-surface-800/50 border-b border-surface-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 text-xs text-surface-500 font-mono">dashboard — AlgoCoach</div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 lg:p-8 space-y-6">
                {/* Top stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-2">
                        <Flame className="w-full h-full text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{streak}</div>
                        <div className="text-xs text-surface-400">Day Streak</div>
                      </div>
                    </div>
                    <div className="w-full bg-surface-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full"
                        style={{ width: `${(streak / 30) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-surface-500 mt-1.5">Next milestone: 30 days</div>
                  </div>

                  <div className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 p-2">
                        <CheckCircle className="w-full h-full text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{totalSolved}</div>
                        <div className="text-xs text-surface-400">Solved</div>
                      </div>
                    </div>
                    <div className="text-xs text-surface-500">+12 this month</div>
                  </div>

                  <div className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-purple-500 p-2">
                        <Target className="w-full h-full text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{weakTopics.length}</div>
                        <div className="text-xs text-surface-400">Weak Topics</div>
                      </div>
                    </div>
                    <div className="text-xs text-surface-500">{weakTopics.join(', ')}</div>
                  </div>

                  <div className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 p-2">
                        <TrendingUp className="w-full h-full text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{completionRate}%</div>
                        <div className="text-xs text-surface-400">Completion</div>
                      </div>
                    </div>
                    <div className="text-xs text-surface-500">Above average</div>
                  </div>
                </div>

                {/* Charts and plan */}
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Monthly Progress Chart */}
                  <div className="lg:col-span-2 glass-card p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Monthly Progress</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyProgress}>
                          <defs>
                            <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" />
                          <XAxis dataKey="month" stroke="#4a5678" fontSize={12} />
                          <YAxis stroke="#4a5678" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#131826',
                              border: '1px solid #37415c',
                              borderRadius: '12px',
                              fontSize: '13px',
                            }}
                            labelStyle={{ color: '#e2e6f0' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="solved"
                            stroke="#6366f1"
                            fill="url(#colorSolved)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Daily Plan */}
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-4">Today's Plan</h3>
                    <div className="space-y-3">
                      {dailyPlan[0].problems.map((problem, i) => (
                        <div key={problem} className="flex items-center gap-3 p-3 bg-surface-800/30 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-accent-400" />
                          <div>
                            <div className="text-sm text-surface-200">{problem}</div>
                            <div className="text-xs text-surface-500">{['Medium', 'Medium', 'Hard'][i]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-surface-500">Next: Sliding Window</div>
                  </div>
                </div>

                {/* Activity heatmap */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-300 mb-3">Recent Activity</h3>
                  <div className="flex gap-2">
                    {recentActivity.map((day) => (
                      <div key={day.day} className="flex-1 text-center">
                        <div
                          className={`h-16 rounded-lg mb-1 transition-colors ${
                            day.completed ? 'bg-accent-500/30' : 'bg-surface-800'
                          }`}
                          style={{
                            background: day.completed
                              ? `linear-gradient(to top, rgba(99,102,241,0.4) ${day.count * 15}%, rgba(30,36,54,1) ${day.count * 15}%)`
                              : undefined,
                          }}
                        />
                        <div className="text-xs text-surface-500 truncate">{day.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
