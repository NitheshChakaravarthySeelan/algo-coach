import { motion } from 'framer-motion'
import { CheckCircle, Users, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: CheckCircle,
    value: '2,000+',
    label: 'Problems Tracked',
    description: 'Comprehensive problem database with difficulty and topic tagging',
    color: 'from-accent-400 to-accent-600',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Early Signups',
    description: 'Growing community of dedicated programmers',
    color: 'from-surface-400 to-surface-200',
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: 'Daily Completion Rate',
    description: 'Of users complete their personalized daily plan',
    color: 'from-surface-500 to-surface-300',
  },
]

export function SocialProof() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900/30 via-accent-500/5 to-surface-900/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Trusted by developers{' '}
            <span className="gradient-text">like you</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-accent-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative glass-card p-8 text-center">
                <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                <div className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-2">{stat.label}</div>
                <p className="text-sm text-surface-400">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
