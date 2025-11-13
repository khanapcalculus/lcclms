import { useEffect, useMemo, useState } from 'react'
import { userService, type TutorWithStudents } from '../services/userService'
import { authService } from '../services/authService'

export const AdminDashboard = () => {
  const [tutors, setTutors] = useState<TutorWithStudents[]>([])
  const [students, setStudents] = useState<Array<{ _id: string; displayName: string; email: string }>>([])
  const [selectedTutor, setSelectedTutor] = useState<string>('') 
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'tutor' as 'admin' | 'tutor' | 'student',
    tutorId: '',
  })
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const [tutorList, studentList] = await Promise.all([
      userService.listTutors(),
      userService.listStudents(),
    ])
    setTutors(tutorList)
    setStudents(studentList)
  }

  useEffect(() => {
    fetchData().catch(console.error)
  }, [])

  const availableStudents = useMemo(() => {
    // Show ALL students - students can be assigned to multiple tutors
    return students
  }, [students])

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const payload =
        form.role === 'student'
          ? { ...form, tutorId: form.tutorId || undefined }
          : { ...form, tutorId: undefined }
      await authService.register(payload)
      setStatus(`Created ${form.role} successfully`)
      setForm({
        email: '',
        password: '',
        displayName: '',
        role: 'tutor',
        tutorId: '',
      })
      await fetchData()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create user')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTutor || selectedStudents.length === 0) {
      setError('Select a tutor and at least one student to assign')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await userService.assignStudents({
        tutorId: selectedTutor,
        studentIds: selectedStudents,
      })
      setStatus('Students assigned successfully')
      setSelectedStudents([])
      await fetchData()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to assign students')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Create User</h2>
        <p className="mt-1 text-sm text-white/70">
          Provision tutors, students, or additional admins.
        </p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Display Name</label>
            <input
              value={form.displayName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, displayName: event.target.value }))
              }
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Role</label>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value as typeof prev.role }))
              }
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
            >
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'student' && (
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs uppercase tracking-[0.25em]">
                Assign tutor (optional)
              </label>
              <select
                value={form.tutorId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tutorId: event.target.value }))
                }
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              >
                <option value="">-- Select tutor --</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.displayName} ({tutor.email})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Assign Students to Tutor</h2>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAssign}>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">Tutor</label>
            <select
              value={selectedTutor}
              onChange={(event) => setSelectedTutor(event.target.value)}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
              required
            >
              <option value="">-- Select tutor --</option>
              {tutors.map((tutor) => (
                <option key={tutor._id} value={tutor._id}>
                  {tutor.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.25em]">
              Students (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={selectedStudents}
              onChange={(event) =>
                setSelectedStudents(Array.from(event.target.selectedOptions, (option) => option.value))
              }
              className="h-32 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm focus:border-sky-400/70 focus:outline-none"
            >
              {availableStudents.map((student) => {
                const isAlreadyAssigned = tutors
                  .find((t) => t._id === selectedTutor)
                  ?.assignedStudents?.some((s) => s._id === student._id)
                return (
                  <option key={student._id} value={student._id}>
                    {student.displayName} ({student.email})
                    {isAlreadyAssigned ? ' ✓' : ''}
                  </option>
                )
              })}
            </select>
            <p className="text-xs text-white/60">
              Students with ✓ are already assigned to this tutor. You can still assign them again for different subjects.
            </p>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Selected Students'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold">Tutor Overview</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{tutor.displayName}</p>
                  <p className="text-xs text-white/60">{tutor.email}</p>
                </div>
                <span className="rounded-full bg-sky-500/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  Tutor
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Assigned Students
                </p>
                {(tutor.assignedStudents ?? []).length === 0 ? (
                  <p className="text-white/60">No students assigned</p>
                ) : (
                  <ul className="space-y-1 text-white/80">
                    {tutor.assignedStudents?.map((student) => (
                      <li key={student._id} className="flex items-center justify-between">
                        <span>{student.displayName}</span>
                        <span className="text-xs text-white/50">{student.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {(status || error) && (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm">
          {status && <p className="text-emerald-300">{status}</p>}
          {error && <p className="text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  )
}

