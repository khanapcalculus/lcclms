import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const roleOptions: Array<{ value: 'admin' | 'tutor' | 'student'; label: string; description: string }> = [
  { value: 'admin', label: 'Admin', description: 'Manage tutors, students, sessions, and analytics.' },
  { value: 'tutor', label: 'Tutor', description: 'Host live classes, schedule sessions, assign homework.' },
  { value: 'student', label: 'Student', description: 'Join live sessions, collaborate on the whiteboard, submit work.' },
]

const roleDashboardMap = {
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
} as const

export const RegisterPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'tutor' | 'student'>('student')
  const [tutorId, setTutorId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await authService.register({
        displayName,
        email,
        password,
        role,
        tutorId: tutorId.trim() ? tutorId.trim() : undefined,
      })

      setAuth({ user: result.user, token: result.token })
      navigate(roleDashboardMap[result.user.role])
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(220,38,38,0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(2,6,23,0.9),rgba(15,23,42,0.82))]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 shadow-[0_45px_120px_rgba(15,23,42,0.55)] backdrop-blur-3xl lg:flex-row">
        <aside className="hidden w-full max-w-sm flex-col justify-between border-r border-white/10 bg-gradient-to-b from-white/10 via-white/8 to-transparent px-10 py-16 lg:flex">
          <div>
            <h2 className="text-sm uppercase tracking-[0.38em] text-slate-200/70">Build your studio</h2>
            <p className="mt-6 text-3xl font-semibold leading-tight text-white">
              Your classroom, homework hub, and collaborative canvas—now in one place.
            </p>
          </div>
          <ul className="space-y-6 text-sm text-slate-200/80">
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_28px_65px_rgba(15,23,42,0.35)]">
              <h3 className="text-sm font-semibold text-white">Session intelligence</h3>
              <p className="mt-1 text-xs text-slate-200/70">
                Keep track of schedules, avoid conflicts, and monitor attendance instantly.
              </p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_28px_65px_rgba(15,23,42,0.35)]">
              <h3 className="text-sm font-semibold text-white">Crystal clear collaboration</h3>
              <p className="mt-1 text-xs text-slate-200/70">
                Fabric.js powers our whiteboard to be buttery-smooth. Draw, drag, annotate without limits.
              </p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_28px_65px_rgba(15,23,42,0.35)]">
              <h3 className="text-sm font-semibold text-white">Role-based dashboards</h3>
              <p className="mt-1 text-xs text-slate-200/70">
                Admins manage tutors and students, tutors orchestrate sessions, and students join seamlessly.
              </p>
            </li>
          </ul>
        </aside>

        <main className="relative flex flex-1 flex-col justify-center px-6 py-16 sm:px-12">
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 px-8 py-10 shadow-[0_40px_110px_rgba(15,23,42,0.6)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-white">Create your account</h1>
              <Link
                to="/login"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-200/80 transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-200/75">
              Choose your role, invite your team, and start collaborating in minutes.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-300/60 focus:border-sky-400/80 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    placeholder="Alex Johnson"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-300/60 focus:border-sky-400/80 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-300/60 focus:border-sky-400/80 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-300/80">Select role</span>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {roleOptions.map((option) => {
                    const isActive = option.value === role
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          isActive
                            ? 'border-sky-400/80 bg-sky-400/15 shadow-[0_20px_45px_rgba(14,116,144,0.35)]'
                            : 'border-white/15 bg-white/8 hover:border-sky-300/60 hover:bg-sky-300/10'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{option.label}</p>
                        <p className="mt-1 text-xs text-slate-200/80">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300/80">
                  Tutor ID (optional)
                </label>
                <input
                  type="text"
                  value={tutorId}
                  onChange={(event) => setTutorId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-300/60 focus:border-sky-400/80 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  placeholder="Provide if your admin shared a tutor assignment code"
                  disabled={role !== 'student'}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-[0_26px_70px_rgba(16,185,129,0.45)] transition hover:scale-[1.01] hover:shadow-[0_30px_80px_rgba(59,130,246,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-200/80">
              Already have access?{' '}
              <Link to="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">
                Sign in instead
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

