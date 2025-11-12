import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sessionService, type Session } from '../services/sessionService'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'

type CreateSessionForm = {
  title: string
  description: string
  scheduledDate: string
  startTime: string
  endTime: string
  timezone: string
  meetingUrl: string
  studentIds: string[]
}

const US_TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { value: 'America/Phoenix', label: 'Mountain Time (MT) - Phoenix (no DST)' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT) - Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT) - Honolulu' },
]

const INTERNATIONAL_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
]

const ALL_TIMEZONES = [...US_TIMEZONES, ...INTERNATIONAL_TIMEZONES]

export const TutorDashboard = () => {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Array<{ _id: string; displayName: string }>>([])
  const [form, setForm] = useState<CreateSessionForm>({
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    timezone: 'America/Los_Angeles',
    meetingUrl: '',
    studentIds: [],
  })
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tutorId = user?.id

  const loadData = async () => {
    if (!tutorId) return
    const [sessionList, studentList] = await Promise.all([
      sessionService.listForTutor(tutorId),
      userService.listStudents(tutorId),
    ])
    setSessions(sessionList)
    setStudents(studentList.map((student) => ({ _id: student._id, displayName: student.displayName })))
  }

  useEffect(() => {
    loadData().catch(console.error)
  }, [tutorId])

  const handleCreateSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tutorId || !user) return
    try {
      setLoading(true)
      setError(null)
      setStatus(null)

      // Parse the date and time in the selected timezone
      const dateTimeStart = `${form.scheduledDate}T${form.startTime}:00`
      const dateTimeEnd = `${form.scheduledDate}T${form.endTime}:00`
      
      // Convert to UTC for storage (backend expects ISO strings in UTC)
      const start = new Date(new Intl.DateTimeFormat('en-US', {
        timeZone: form.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date(dateTimeStart)))
      
      const end = new Date(new Intl.DateTimeFormat('en-US', {
        timeZone: form.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date(dateTimeEnd)))

      await sessionService.create({
        title: form.title,
        description: form.description || undefined,
        tutorId,
        studentIds: form.studentIds,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        meetingUrl: form.meetingUrl || undefined,
        createdBy: user.id,
      })

      setStatus('Session scheduled successfully')
      setForm({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        timezone: 'America/Los_Angeles',
        meetingUrl: '',
        studentIds: [],
      })
      await loadData()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to schedule session')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Schedule a Session</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateSession}>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Meeting URL (optional)</label>
            <input
              value={form.meetingUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, meetingUrl: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.25em]">Description</label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, scheduledDate: event.target.value }))
              }
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Timezone</label>
            <select
              value={form.timezone}
              onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            >
              <optgroup label="United States">
                {US_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="International">
                {INTERNATIONAL_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.25em]">Students</label>
            <select
              multiple
              value={form.studentIds}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  studentIds: Array.from(event.target.selectedOptions, (option) => option.value),
                }))
              }
              className="h-32 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
        {(status || error) && (
          <p className={`mt-4 text-sm ${status ? 'text-emerald-300' : 'text-rose-300'}`}>
            {status ?? error}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-white/70">No sessions scheduled yet.</p>
          ) : (
            sessions.map((session) => (
              <article key={session._id} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{session.title}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                    {session.status}
                  </span>
                </header>
                <p className="mt-2 text-sm text-white/70">
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
                {session.meetingUrl && (
                  <p className="mt-1 text-xs">
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 underline"
                    >
                      External meeting link
                    </a>
                  </p>
                )}
                <footer className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/60">
                    {session.studentIds.length} attendee{session.studentIds.length === 1 ? '' : 's'}
                  </span>
                  <Link
                    to={`/session/${session._id}`}
                    className="rounded-full bg-sky-500/80 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-sky-400"
                  >
                    Open Whiteboard
                  </Link>
                </footer>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

