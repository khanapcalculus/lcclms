import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const roleDashboardMap = {
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
} as const

export const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await authService.login({ email, password })
      setAuth({ user: result.user!, token: result.token })
      const target = roleDashboardMap[result.user!.role]
      navigate(target)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unexpected error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100 sm:px-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/12 bg-white/5 shadow-[0_32px_120px_rgba(15,23,42,0.55)] backdrop-blur-[36px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.15),transparent_55%)]" />

        <div className="relative px-10 py-12">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-slate-200/80">
              LCC
            </span>
            <Link
              to="/register"
              className="text-xs font-semibold text-sky-200 transition hover:text-sky-100"
            >
              Create account
            </Link>
          </div>

          <div className="mt-8 space-y-2">
            <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-300/80">
              Sign in to continue. Your dashboard, sessions, and whiteboards are waiting.
            </p>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs text-slate-300/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400/80 transition focus:border-sky-300/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300/80">
                <label>Password</label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-slate-100/70 transition hover:text-sky-200"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400/80 transition focus:border-sky-300/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(59,130,246,0.45)] transition hover:scale-[1.01] hover:shadow-[0_22px_58px_rgba(59,130,246,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-300/75">
            Need access?{' '}
            <Link to="/register" className="font-semibold text-sky-300 transition hover:text-sky-200">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

