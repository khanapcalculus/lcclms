import { LogOut, Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { AppTheme } from '../../App'
import logoImage from '../../assets/logo.png'

type DashboardLayoutProps = {
  theme: AppTheme
  onToggleTheme: () => void
  children: React.ReactNode
}

const navLinks = [
  { to: '/admin', label: 'Admin', roles: ['admin'] },
  { to: '/tutor', label: 'Tutor', roles: ['tutor'] },
  { to: '/student', label: 'Student', roles: ['student'] },
]

export const DashboardLayout = ({ theme, onToggleTheme, children }: DashboardLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const filteredLinks = navLinks.filter((link) => user && link.roles.includes(user.role))

  const gradientClass =
    theme === 'dark'
      ? 'from-slate-950 via-slate-900 to-slate-950'
      : 'from-slate-100 via-white to-slate-200'

  const textClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-900'

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${gradientClass} ${textClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay [background-image:linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="relative z-10 flex items-center justify-between border-b border-white/8 bg-white/5 px-8 py-4 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <img src={logoImage} alt="LCC Logo" className="h-10 w-auto" />
          <nav className="flex items-center gap-2">
            {filteredLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith(link.to)
                    ? theme === 'dark'
                      ? 'bg-sky-500/20 text-sky-200 shadow-lg ring-1 ring-sky-400/50'
                      : 'bg-blue-500/20 text-blue-800 shadow-lg ring-1 ring-blue-500/50'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/8'
                      : 'text-slate-700 hover:bg-slate-900/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
              theme === 'dark'
                ? 'border-white/15 bg-white/8 text-slate-100 hover:bg-white/12'
                : 'border-slate-300/70 bg-white/80 text-slate-700 hover:bg-white'
            }`}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-2 ${
              theme === 'dark'
                ? 'border-white/10 bg-white/5'
                : 'border-slate-300/70 bg-white/80'
            }`}
          >
            <div className="flex flex-col text-right text-xs">
              <span className="font-semibold">{user?.displayName}</span>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                theme === 'dark'
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25'
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-8 py-10">{children}</main>
    </div>
  )
}

