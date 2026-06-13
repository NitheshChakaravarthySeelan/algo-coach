import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/use-session'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'

const steps = ['Experience', 'Goals', 'Weak Topics', 'Commitment']

const experienceOptions = [
  { value: 'beginner', label: 'Beginner', desc: 'New to LeetCode or solved fewer than 50 problems' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Comfortable with Easy, working on Medium' },
  { value: 'advanced', label: 'Advanced', desc: 'Can solve most Mediums, tackling Hards' },
  { value: 'competitive', label: 'Competitive', desc: 'Regular contest participant, aiming for top rankings' },
]

const goalOptions = [
  'Job Interviews', 'FAANG Preparation', 'LeetCode Rating',
  'Competitive Programming', 'General Problem Solving',
]

const topicOptions = [
  'Array', 'String', 'Hash Table', 'Linked List', 'Stack', 'Queue',
  'Binary Tree', 'Binary Search Tree', 'Heap', 'Graph', 'Trie',
  'Dynamic Programming', 'Recursion', 'Greedy', 'Sorting',
  'Binary Search', 'Two Pointers', 'Sliding Window', 'Backtracking',
  'Math', 'Bit Manipulation', 'Design', 'Database',
]

export function Onboard() {
  const navigate = useNavigate()
  const { data: session, isPending: authLoading } = useSession()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [experience, setExperience] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState('')
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState('')
  const [hours, setHours] = useState(10)
  const [targetDate, setTargetDate] = useState('')

  useEffect(() => {
    if (!authLoading && !session) navigate('/', { replace: true })
  }, [session, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  function toggleGoal(goal: string) {
    setGoals((p) => p.includes(goal) ? p.filter((g) => g !== goal) : [...p, goal])
  }

  function toggleTopic(topic: string) {
    setWeakTopics((p) => p.includes(topic) ? p.filter((t) => t !== topic) : [...p, topic])
  }

  function addCustomGoal() {
    const trimmed = customGoal.trim()
    if (trimmed && !goals.includes(trimmed)) {
      setGoals([...goals, trimmed])
      setCustomGoal('')
    }
  }

  function addCustomTopic() {
    const trimmed = customTopic.trim()
    if (trimmed && !weakTopics.includes(trimmed)) {
      setWeakTopics([...weakTopics, trimmed])
      setCustomTopic('')
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.onboard.submit({
        experienceLevel: experience,
        goals,
        weakTopics,
        hoursPerWeek: hours,
        targetDate: targetDate || undefined,
      })
      if (res.success) {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences')
    } finally {
      setSubmitting(false)
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return !!experience
      case 1: return goals.length > 0
      case 2: return weakTopics.length > 0
      case 3: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">AlgoCoach</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? 'bg-accent-600 text-white' :
                i === step ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40' :
                'bg-surface-800 text-surface-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 transition-colors ${i < step ? 'bg-accent-600' : 'bg-surface-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What's your experience level?</h2>
                  <p className="text-sm text-surface-400">This helps us tailor the difficulty of your plan.</p>
                </div>
                <div className="space-y-3">
                  {experienceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setExperience(opt.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        experience === opt.value
                          ? 'bg-accent-500/10 border-accent-500/40'
                          : 'bg-surface-800/50 border-surface-700/50 hover:border-surface-600'
                      }`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-surface-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What are your goals?</h2>
                  <p className="text-sm text-surface-400">Select all that apply.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        goals.includes(goal)
                          ? 'bg-accent-500/10 border-accent-500/40 text-accent-300'
                          : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomGoal()}
                    placeholder="Add a custom goal..."
                    className="flex-1 px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 text-sm focus:outline-none focus:border-accent-500/50"
                  />
                  <Button variant="secondary" size="sm" onClick={addCustomGoal} disabled={!customGoal.trim()}>Add</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Which topics are your weaknesses?</h2>
                  <p className="text-sm text-surface-400">The plan will prioritize these topics.</p>
                </div>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                  {topicOptions.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        weakTopics.includes(topic)
                          ? 'bg-accent-500/10 border-accent-500/40 text-accent-300'
                          : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-600'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                    placeholder="Add a custom topic..."
                    className="flex-1 px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 placeholder-surface-500 text-sm focus:outline-none focus:border-accent-500/50"
                  />
                  <Button variant="secondary" size="sm" onClick={addCustomTopic} disabled={!customTopic.trim()}>Add</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Your commitment</h2>
                  <p className="text-sm text-surface-400">How much time can you dedicate each week?</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Hours per week: <span className="text-accent-400">{hours}h</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-full accent-accent-500"
                    />
                    <div className="flex justify-between text-xs text-surface-500 mt-1">
                      <span>1h</span>
                      <span>40h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Target date <span className="text-surface-500">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">{error}</div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your plan...</> : 'Create My Plan'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
