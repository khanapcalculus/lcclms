import { Moon, Sun, Users } from 'lucide-react'
import type { AppTheme } from '../../App'
import logoImage from '../../assets/logo.png'
import type { PresenceEntry } from '../../hooks/useSessionPresence'
import { PaletteFlyout } from './controls/PaletteFlyout'
import { ToolRail } from './controls/ToolRail'
import { WhiteboardCanvas } from './core/WhiteboardCanvas'

type WhiteboardShellProps = {
  theme: AppTheme
  onToggleTheme: () => void
  sessionTitle?: string
  participants?: PresenceEntry[]
  currentUserId?: string
  emitCursorMove?: (payload: { x: number; y: number }) => void
  subscribeCursorMove?: (
    handler: (payload: {
      userId: string
      displayName: string
      role: PresenceEntry['role']
      x: number
      y: number
    }) => void
  ) => () => void
  emitWhiteboardOperation?: (payload: unknown) => void
  subscribeWhiteboardOperation?: (
    handler: (payload: { userId: string; state: unknown }) => void
  ) => () => void
}

const roleColorMap: Record<PresenceEntry['role'], string> = {
  admin: 'bg-purple-500/80',
  tutor: 'bg-sky-500/80',
  student: 'bg-emerald-500/80',
}

export const WhiteboardShell = ({
  theme,
  onToggleTheme,
  sessionTitle,
  participants,
  currentUserId,
  emitCursorMove,
  subscribeCursorMove,
  emitWhiteboardOperation,
  subscribeWhiteboardOperation,
}: WhiteboardShellProps) => {
  const gradientClass =
    theme === 'dark'
      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      : 'bg-gradient-to-br from-slate-100 via-white to-slate-200'

  const auraClass =
    theme === 'dark'
      ? 'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.12),_transparent_55%)]'
      : 'bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.2),_transparent_55%)]'

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden ${gradientClass}`}>
      <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 sm:left-8">
        <div className="flex flex-col items-center gap-6">
          <ToolRail orientation="vertical" theme={theme} />
          <PaletteFlyout theme={theme} />
        </div>
      </div>
      <div className="absolute right-6 top-6 z-20 flex flex-col items-center gap-3">
        <img src={logoImage} alt="Studio logo" className="max-h-16 max-w-[120px]" />
        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
            theme === 'dark'
              ? 'border-white/20 bg-white/10 text-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.45)] hover:bg-white/16'
              : 'border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_12px_28px_rgba(148,163,184,0.35)] hover:bg-white'
          } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
      {participants && participants.length > 0 && (
        <div className="absolute left-6 top-6 z-20 flex gap-3">
          {participants.map((participant) => {
            const initials = participant.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            
            return (
              <div
                key={participant.userId}
                className="group relative"
                title={`${participant.displayName} (${participant.role})`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-transform hover:scale-110 ${
                    participant.role === 'admin'
                      ? 'border-purple-400/70 bg-purple-500/80'
                      : participant.role === 'tutor'
                        ? 'border-sky-400/70 bg-sky-500/80'
                        : 'border-emerald-400/70 bg-emerald-500/80'
                  }`}
                >
                  {initials}
                </div>
                <div className="absolute left-0 top-full mt-3 hidden whitespace-nowrap rounded-xl border border-white/15 bg-slate-900/95 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-xl group-hover:block">
                  <p className="font-semibold">{participant.displayName}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60">
                    {participant.role}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="relative flex h-full w-full items-center justify-center px-0 py-0">
        <div className={`absolute inset-0 -z-10 ${auraClass} blur-3xl`}></div>
        <WhiteboardCanvas
          theme={theme}
          participants={participants}
          currentUserId={currentUserId}
          emitCursorMove={emitCursorMove}
          subscribeCursorMove={subscribeCursorMove}
          emitWhiteboardOperation={emitWhiteboardOperation}
          subscribeWhiteboardOperation={subscribeWhiteboardOperation}
        />
      </div>
    </div>
  )
}

