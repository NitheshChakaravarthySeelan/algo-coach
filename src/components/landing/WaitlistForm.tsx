import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, User, Code, ChevronDown, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const experienceLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'competitive', label: 'Competitive Programmer' },
]

export function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    leetcodeUsername: '',
    experience: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="py-24 relative" id="waitlist">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-surface-400">
              Welcome to AlgoCoach, {formData.name}. We'll notify you at{' '}
              <span className="text-accent-400">{formData.email}</span> when we launch.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 relative" id="waitlist">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Join the{' '}
            <span className="gradient-text">waitlist</span>
          </h2>
          <p className="text-surface-400 text-lg">
            Be the first to experience personalized LeetCode practice. Early adopters get exclusive perks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-surface-300">
                  Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-surface-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="leetcodeUsername" className="block text-sm font-medium text-surface-300">
                  LeetCode Username
                </label>
                <div className="relative">
                  <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    id="leetcodeUsername"
                    name="leetcodeUsername"
                    type="text"
                    value={formData.leetcodeUsername}
                    onChange={handleChange}
                    placeholder="your_leetcode_id"
                    className="w-full pl-10 pr-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="experience" className="block text-sm font-medium text-surface-300">
                  Experience Level <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select level...
                    </option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2">
              Join Waitlist
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-surface-500 text-center">
              No spam. We'll only email you about AlgoCoach updates and early access.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
