import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

export function WaitlistSection({ onComplete }: { onComplete: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.survey.submit({ email: email.trim(), struggles: [], desiredFeature: '', goals: [] })
      localStorage.setItem('algocoach_email', email.trim())
      setDone(true)
      onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to join')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <section className="py-24 relative bg-surface-900/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12">
            <CheckCircle2 className="w-12 h-12 text-accent-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-surface-400">Help us tailor AlgoCoach to your needs below.</p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 relative bg-surface-900/30" id="waitlist">
      <div className="max-w-xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Join the{' '}
            <span className="gradient-text">waitlist</span>
          </h2>
          <p className="text-surface-400 text-lg">
            Be the first to try AlgoCoach when we launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50"
                />
              </div>
              <Button type="submit" disabled={loading || !email.trim()}>
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Join</>}
              </Button>
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
