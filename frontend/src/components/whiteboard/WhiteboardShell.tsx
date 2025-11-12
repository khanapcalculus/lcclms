import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import type { AppTheme } from '../../App'
import logoImage from '../../assets/logo.png'
import type { PresenceEntry } from '../../hooks/useSessionPresence'
import { CanvasActions } from './controls/CanvasActions'
import { PaletteFlyout } from './controls/PaletteFlyout'
import { ToolRail } from './controls/ToolRail'
import { WhiteboardCanvas } from './core/WhiteboardCanvas'

type WhiteboardShellProps = {
  theme: AppTheme
  onToggleTheme: () => void
  sessionId?: string
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

export const WhiteboardShell = ({
  theme,
  onToggleTheme,
  sessionId,
  participants,
  currentUserId,
  emitCursorMove,
  subscribeCursorMove,
  emitWhiteboardOperation,
  subscribeWhiteboardOperation,
}: WhiteboardShellProps) => {
  const [undoHandler, setUndoHandler] = useState<(() => void) | null>(null)
  const [redoHandler, setRedoHandler] = useState<(() => void) | null>(null)
  const [clearHandler, setClearHandler] = useState<(() => void) | null>(null)
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })

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
      <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2 sm:left-4 md:left-8">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <ToolRail orientation="vertical" theme={theme} />
          <PaletteFlyout theme={theme} />
        </div>
      </div>
      <div className="absolute right-2 top-2 z-20 flex flex-col items-center gap-2 sm:right-4 sm:top-4 sm:gap-3 md:right-6 md:top-6">
        <img src={logoImage} alt="Studio logo" className="max-h-10 max-w-[80px] sm:max-h-12 sm:max-w-[100px] md:max-h-16 md:max-w-[120px]" />
        <button
          type="button"
          onClick={onToggleTheme}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border sm:h-12 sm:w-12 ${
            theme === 'dark'
              ? 'border-white/20 bg-white/10 text-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.45)] hover:bg-white/16'
              : 'border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_12px_28px_rgba(148,163,184,0.35)] hover:bg-white'
          } transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
        
        <div className="mt-2 sm:mt-4">
          <CanvasActions
            theme={theme}
            onUndo={() => undoHandler?.()}
            onRedo={() => redoHandler?.()}
            onClear={() => clearHandler?.()}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
          />
        </div>
      </div>
      {participants && participants.length > 0 && (
        <div className="absolute left-2 top-2 z-20 flex gap-2 sm:left-4 sm:top-4 sm:gap-3 md:left-6 md:top-6">
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-transform hover:scale-110 sm:h-12 sm:w-12 sm:text-sm ${
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
          sessionId={sessionId}
          participants={participants}
          currentUserId={currentUserId}
          emitCursorMove={emitCursorMove}
          subscribeCursorMove={subscribeCursorMove}
          emitWhiteboardOperation={emitWhiteboardOperation}
          subscribeWhiteboardOperation={subscribeWhiteboardOperation}
          onUndo={(handler) => setUndoHandler(() => handler)}
          onRedo={(handler) => setRedoHandler(() => handler)}
          onClear={(handler) => setClearHandler(() => handler)}
          onHistoryChange={setHistoryState}
        />
      </div>
    </div>
  )
}

