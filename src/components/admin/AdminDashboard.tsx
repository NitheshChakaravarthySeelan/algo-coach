import { motion } from 'framer-motion'
import { Users, TrendingUp, Target, BarChart3, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import {
  experienceDistribution,
  painPointData,
  goalDistribution,
  requestedFeatures,
  monthlySignups,
  mockWaitlistData,
} from '@/data/mockData'

export function AdminDashboard() {
  const totalSignups = mockWaitlistData.length

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Analytics</h1>
              <div className="px-2.5 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-xs text-accent-400">
                Beta
              </div>
            </div>
            <p className="text-surface-400">Onboarding data and user insights</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </motion.div>

        {/* Stats Grid */}
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
                <div className="text-2xl font-bold text-white">{totalSignups}</div>
                <div className="text-xs text-surface-400">Total Signups</div>
              </div>
            </div>
            <div className="text-xs text-emerald-400">+245 this month</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-xs text-surface-400">Conversion Rate</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Waitlist to survey</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{painPointData.length}</div>
                <div className="text-xs text-surface-400">Pain Points</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Identified</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{goalDistribution.length}</div>
                <div className="text-xs text-surface-400">Goal Categories</div>
              </div>
            </div>
            <div className="text-xs text-surface-500">Tracked</div>
          </div>
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* Monthly Signups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-surface-300 mb-1">Monthly Signups</h3>
            <p className="text-xs text-surface-500 mb-4">Growth over the last 6 months</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" />
                  <XAxis dataKey="month" stroke="#4a5678" fontSize={12} />
                  <YAxis stroke="#4a5678" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131826',
                      border: '1px solid #37415c',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#e2e6f0' }}
                  />
                  <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Experience Distribution */}
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
                  <Pie
                    data={experienceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {experienceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131826',
                      border: '1px solid #37415c',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {experienceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-surface-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* Pain Points */}
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
                <BarChart data={painPointData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" horizontal={false} />
                  <XAxis type="number" stroke="#4a5678" fontSize={12} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#4a5678" fontSize={12} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131826',
                      border: '1px solid #37415c',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#e2e6f0' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Goal Distribution */}
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
                  <Pie
                    data={goalDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {goalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131826',
                      border: '1px solid #37415c',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {goalDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-surface-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Requested Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-sm font-semibold text-surface-300 mb-1">Most Requested Features</h3>
          <p className="text-xs text-surface-500 mb-4">What users want most</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestedFeatures}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2436" />
                <XAxis dataKey="name" stroke="#4a5678" fontSize={12} />
                <YAxis stroke="#4a5678" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131826',
                    border: '1px solid #37415c',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#e2e6f0' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                  {requestedFeatures.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#818cf8' : index === 1 ? '#6366f1' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Signups Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-surface-300 mb-4">Recent Signups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">LeetCode</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Level</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Goals</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockWaitlistData.map((entry) => (
                  <tr key={entry.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 px-3 text-surface-200">{entry.name}</td>
                    <td className="py-3 px-3 text-surface-300">{entry.email}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-accent-400 text-xs">{entry.leetcodeUsername}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-surface-300">{entry.experience}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {entry.goals.map((goal) => (
                          <span key={goal} className="px-2 py-0.5 bg-accent-500/10 text-accent-400 rounded text-xs">
                            {goal === 'FAANG Preparation' ? 'FAANG' : goal === 'General Problem Solving' ? 'General' : goal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-surface-400 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
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
