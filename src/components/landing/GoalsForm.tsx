import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Trophy, Swords, Puzzle, Target, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const goals = [
  { id: 'interviews', label: 'Job Interviews', icon: Briefcase, description: 'Ace technical interviews at top companies' },
  { id: 'rating', label: 'LeetCode Rating', icon: Trophy, description: 'Climb the LeetCode leaderboard' },
  { id: 'competitive', label: 'Competitive Programming', icon: Swords, description: 'Compete in contests and improve ranking' },
  { id: 'general', label: 'General Problem Solving', icon: Puzzle, description: 'Become a better algorithmic thinker' },
  { id: 'faang', label: 'FAANG Preparation', icon: Target, description: 'Prepare for FAANG and big tech interviews' },
]

export function GoalsForm() {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="py-24 relative" id="goals">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Goals saved!</h3>
            <p className="text-surface-400">We'll tailor AlgoCoach to help you achieve your targets.</p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 relative" id="goals">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            What are you{' '}
            <span className="gradient-text">optimizing for</span>?
          </h2>
          <p className="text-surface-400 text-lg">
            Tell us your goals and we'll build the perfect practice plan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const isSelected = selected.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggle(goal.id)}
                    className={`glass-card p-5 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-accent-500/40 bg-accent-500/5'
                        : 'hover:border-surface-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-accent-500/20 text-accent-400'
                            : 'bg-surface-800 text-surface-400'
                        }`}
                      >
                        <goal.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{goal.label}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-surface-400 mt-1">{goal.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="text-center pt-4">
              <Button type="submit" size="lg" className="gap-2">
                Save My Goals
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
