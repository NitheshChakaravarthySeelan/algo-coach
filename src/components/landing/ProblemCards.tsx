import { motion } from 'framer-motion'
import {
  Layers,
  Activity,
  RotateCcw,
  ArrowUpRight,
  LogOut,
  Brain,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

const problems = [
  {
    icon: Layers,
    title: 'Too many problems',
    description: 'Over 3,000 problems with no clear path on where to start or what to focus on next.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Activity,
    title: 'Inconsistent practice',
    description: 'Skipping days turns into weeks. Without structure, consistency is nearly impossible.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: RotateCcw,
    title: 'Forgetting topics',
    description: 'You solved DP last month, but now it feels like starting from scratch again.',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: ArrowUpRight,
    title: 'No progression',
    description: 'Jumping between Easy and Hard randomly without a structured difficulty ramp.',
    color: 'from-emerald-400 to-green-500',
  },
  {
    icon: LogOut,
    title: 'Returning is painful',
    description: 'After a long break, you have no idea where you left off or what to revisit.',
    color: 'from-rose-400 to-rose-600',
  },
  {
    icon: Brain,
    title: 'No weak-spot focus',
    description: 'You keep solving what you are good at instead of targeting your actual weaknesses.',
    color: 'from-cyan-400 to-cyan-600',
  },
]

export function ProblemCards() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 via-transparent to-surface-900/50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            The struggle is{' '}
            <span className="gradient-text">real</span>
          </h2>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto">
            Every programmer faces these roadblocks. AlgoCoach eliminates them.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, index) => (
            <Card key={problem.title} index={index}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${problem.color} p-2.5 mb-4`}>
                <problem.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
