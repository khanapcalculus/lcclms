import { Eraser, Redo, Trash2, Undo } from 'lucide-react'
import type { AppTheme } from '../../../App'

type CanvasActionsProps = {
  theme: AppTheme
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canUndo: boolean
  canRedo: boolean
}

export const CanvasActions = ({
  theme,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: CanvasActionsProps) => {
  const buttonBaseClasses =
    theme === 'dark'
      ? 'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-slate-100 shadow-[0_12px_25px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-all hover:bg-white/16 hover:shadow-[0_18px_35px_rgba(15,23,42,0.35)]'
      : 'flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300/70 bg-white/80 text-slate-700 shadow-[0_12px_25px_rgba(148,163,184,0.3)] backdrop-blur-xl transition-all hover:bg-white hover:shadow-[0_18px_35px_rgba(148,163,184,0.25)]'

  const disabledClasses = 'opacity-40 cursor-not-allowed hover:bg-white/10 hover:shadow-[0_12px_25px_rgba(15,23,42,0.4)]'

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonBaseClasses} ${!canUndo ? disabledClasses : ''}`}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-5 w-5" />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`${buttonBaseClasses} ${!canRedo ? disabledClasses : ''}`}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-5 w-5" />
      </button>

      <div className="my-2 h-px bg-white/10" />

      <button
        onClick={onClear}
        className={`${buttonBaseClasses} hover:bg-rose-500/20 hover:text-rose-300`}
        title="Clear Canvas"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}

