import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-sm text-accent-400"
            >
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              Early Access — Join 500+ developers
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
              Stop wondering{' '}
              <span className="gradient-text">what to solve next</span>.
            </h1>

            <p className="text-lg sm:text-xl text-surface-400 leading-relaxed max-w-xl">
              Connect your LeetCode profile and receive a personalized daily problem plan
              designed around your strengths, weaknesses, and goals.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play className="w-4 h-4" />
                View Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 border-2 border-surface-950"
                  />
                ))}
              </div>
              <div className="text-sm text-surface-400">
                <span className="text-white font-semibold">500+</span> developers joined
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-3xl blur-2xl" />
            <div className="relative glass-card p-1">
              <div className="bg-surface-900 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-800/50 border-b border-surface-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="ml-4 text-xs text-surface-500 font-mono">dashboard — AlgoCoach</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Streak', value: '12 days', color: 'from-surface-400 to-surface-200' },
                      { label: 'Solved', value: '147', color: 'from-surface-300 to-surface-100' },
                      { label: 'Rate', value: '95%', color: 'from-accent-400 to-accent-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="glass-card p-3 text-center">
                        <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-xs text-surface-500 font-mono mb-2">Today's Plan</div>
                    <div className="space-y-2">
                      {['Two Sum II', '3Sum', 'Container With Most Water'].map((problem) => (
                        <div key={problem} className="flex items-center gap-2 text-sm text-surface-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                          {problem}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-12 flex-1 rounded-lg ${i === 3 ? 'bg-surface-800' : 'bg-accent-500/30'} transition-colors`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
