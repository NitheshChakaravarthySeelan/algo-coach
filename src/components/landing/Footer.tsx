import { Code2, Globe, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AlgoCoach</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-surface-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#dashboard" className="text-sm text-surface-400 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#waitlist" className="text-sm text-surface-400 hover:text-white transition-colors">
              Waitlist
            </a>
            <a href="/admin" className="text-sm text-surface-400 hover:text-white transition-colors">
              Admin
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-surface-500 hover:text-surface-300 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="text-surface-500 hover:text-surface-300 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-800/50 text-center text-sm text-surface-500">
          Built for developers who want to stay consistent.
        </div>
      </div>
    </footer>
  )
}
