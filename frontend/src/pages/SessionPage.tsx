import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sessionService, type Session } from '../services/sessionService'
import { useSessionPresence } from '../hooks/useSessionPresence'
import { WhiteboardShell } from '../components/whiteboard/WhiteboardShell'
import { useAuthStore } from '../store/authStore'
import type { AppTheme } from '../App'

type SessionPageProps = {
  theme: AppTheme
  onToggleTheme: () => void
}

export const SessionPage = ({ theme, onToggleTheme }: SessionPageProps) => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    presence,
    emitCursorMove,
    subscribeCursorMove,
    emitWhiteboardOperation,
    subscribeWhiteboardOperation,
  } = useSessionPresence(sessionId)

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || !user) return
      try {
        setLoading(true)
        const list =
          user.role === 'tutor'
            ? await sessionService.listForTutor(user.id)
            : await sessionService.listForStudent(user.id)
        const match = list.find((item) => item._id === sessionId)
        if (!match) {
          setError('Session not found or access denied')
        } else {
          setSession(match)
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load session')
        }
      } finally {
        setLoading(false)
      }
    }
    loadSession().catch(console.error)
  }, [sessionId, user])

  if (!sessionId) {
    return <p className="p-10 text-center text-sm text-white/80">Missing session ID.</p>
  }

  if (loading) {
    return <p className="p-10 text-center text-sm text-white/80">Loading session...</p>
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p className="text-lg">{error ?? 'Session not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <WhiteboardShell
      theme={theme}
      onToggleTheme={onToggleTheme}
      sessionId={sessionId}
      participants={presence}
      currentUserId={user?.id}
      emitCursorMove={emitCursorMove}
      subscribeCursorMove={subscribeCursorMove}
      emitWhiteboardOperation={emitWhiteboardOperation}
      subscribeWhiteboardOperation={subscribeWhiteboardOperation}
    />
  )
}

