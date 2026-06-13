import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Menu, X, LogIn, GitBranch, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { useSession } from '@/lib/use-session'
import { useTheme } from '@/lib/theme'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
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
            {session ? (
              <a href="/dashboard">
                <Button size="sm" variant="outline">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </a>
            ) : (
              <SignInDropdown />
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-surface-400 hover:text-white transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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
          <div className="pt-2 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {session ? (
              <a href="/dashboard" className="block w-full" onClick={() => setIsOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </a>
            ) : (
              <>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })}
                >
                  <GitBranch className="w-4 h-4" />
                  Sign in with GitHub
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

function SignInDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 mt-2 w-48 bg-surface-900 border border-surface-700 rounded-xl overflow-hidden shadow-xl z-50"
          >
            <button
              onClick={() => { authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' }); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Continue with GitHub
            </button>
            <button
              onClick={() => { authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' }); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Continue with Google
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
