import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sessionService, type Session } from '../services/sessionService'
import { useAuthStore } from '../store/authStore'

export const StudentDashboard = () => {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return
      try {
        setLoading(true)
        setError(null)
        const list = await sessionService.listForStudent(user.id)
        setSessions(list)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load sessions')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSessions().catch(console.error)
  }, [user])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
        {loading && <p className="mt-4 text-sm text-white/70">Loading sessions...</p>}
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        {!loading && !error && sessions.length === 0 && (
          <p className="mt-4 text-sm text-white/70">No upcoming sessions yet.</p>
        )}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {sessions.map((session) => (
            <article key={session._id} className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <header className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{session.title}</h3>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  {session.status}
                </span>
              </header>
              <p className="text-sm text-white/70">
                {new Date(session.scheduledStart).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}{' '}
                -{' '}
                {new Date(session.scheduledEnd).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </p>
              {session.description && (
                <p className="mt-2 text-sm text-white/80">{session.description}</p>
              )}
              <footer className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/60">
                  {session.meetingUrl ? (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 underline"
                    >
                      External meeting
                    </a>
                  ) : (
                    'Join via whiteboard'
                  )}
                </span>
                <Link
                  to={`/session/${session._id}`}
                  className="rounded-full bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                >
                  Go to Session
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

