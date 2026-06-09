import { motion } from 'framer-motion'
import {
  CalendarCheck,
  TrendingUp,
  Target,
  Flame,
  Swords,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const features = [
  {
    icon: CalendarCheck,
    title: 'Personalized Daily Plans',
    description: 'Every morning, get a curated set of problems tailored to your skill level, weak topics, and long-term goals.',
    badge: 'Core',
    badgeVariant: 'success' as const,
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your improvement over time with detailed analytics on solving patterns, speed, and accuracy.',
    badge: 'Core',
    badgeVariant: 'success' as const,
  },
  {
    icon: Target,
    title: 'Weak Topic Detection',
    description: 'Our algorithm identifies patterns in your submissions to pinpoint exactly which topics need more work.',
    badge: 'Core',
    badgeVariant: 'success' as const,
  },
  {
    icon: Flame,
    title: 'Streak System',
    description: 'Stay motivated with daily streaks, achievement badges, and friendly competition with peers.',
    badge: 'Core',
    badgeVariant: 'success' as const,
  },
  {
    icon: Swords,
    title: 'Contest Preparation',
    description: 'Practice with time-constrained sessions modeled after real LeetCode contests and company assessments.',
    badge: 'Pro',
    badgeVariant: 'info' as const,
  },
  {
    icon: Sparkles,
    title: 'AI Recommendations',
    description: 'Advanced ML models will soon provide next-level problem recommendations and learning path optimization.',
    badge: 'Coming Soon',
    badgeVariant: 'warning' as const,
  },
]

export function FeaturesGrid() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="gradient-text">stay consistent</span>
          </h2>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto">
            A comprehensive toolkit designed to turn sporadic practice into daily progress.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={feature.title} index={index}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 p-2.5">
                  <feature.icon className="w-full h-full text-accent-400" />
                </div>
                <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
