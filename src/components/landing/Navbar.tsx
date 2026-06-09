import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Waitlist', href: '#waitlist' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AlgoCoach</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-surface-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a href="/admin">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </a>
            <a href="#waitlist">
              <Button size="sm">Join Waitlist</Button>
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-surface-400 hover:text-white p-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-surface-900 border-b border-surface-800 px-4 py-4 space-y-3"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-sm text-surface-400 hover:text-white py-2 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 flex gap-3">
            <a href="/admin" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Admin
              </Button>
            </a>
            <a href="#waitlist" className="flex-1" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full">
                Join Waitlist
              </Button>
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
