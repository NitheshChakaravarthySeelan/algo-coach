import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

const struggles = [
  { id: 'consistency', label: 'Staying consistent' },
  { id: 'problems', label: 'Finding good problems' },
  { id: 'contest', label: 'Contest preparation' },
  { id: 'interview', label: 'Interview preparation' },
  { id: 'dp', label: 'Dynamic Programming' },
  { id: 'graphs', label: 'Graphs' },
  { id: 'motivation', label: 'Motivation' },
]

export function InterestSurvey() {
  const [selected, setSelected] = useState<string[]>([])
  const [feature, setFeature] = useState('')
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
      <section className="py-24 relative bg-surface-900/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Thanks for your feedback!</h3>
            <p className="text-surface-400">Your input helps us build something truly useful.</p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 relative bg-surface-900/30" id="survey">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Tell us what{' '}
            <span className="gradient-text">hurts</span>
          </h2>
          <p className="text-surface-400 text-lg">
            Your biggest struggle is our top priority to solve.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What is your biggest struggle?</h3>
              <p className="text-sm text-surface-400">Select all that apply.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {struggles.map((struggle) => (
                  <button
                    key={struggle.id}
                    type="button"
                    onClick={() => toggle(struggle.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${
                      selected.includes(struggle.id)
                        ? 'bg-accent-500/10 border-accent-500/40 text-accent-300'
                        : 'bg-surface-800/30 border-surface-700/50 text-surface-300 hover:border-surface-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selected.includes(struggle.id)
                          ? 'bg-accent-500 border-accent-500'
                          : 'border-surface-600'
                      }`}
                    >
                      {selected.includes(struggle.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {struggle.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                What feature would make this product indispensable?
              </h3>
              <textarea
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="Describe the one feature that would make AlgoCoach essential for your daily practice..."
                rows={4}
                className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-200 resize-none"
              />
            </div>

            <Button type="submit" size="lg" className="w-full gap-2">
              Submit Feedback
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
