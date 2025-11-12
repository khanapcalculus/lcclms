import { Moon, Sun } from 'lucide-react'
import type { AppTheme } from '../../App'
import logoImage from '../../assets/logo.png'
import { PaletteFlyout } from './controls/PaletteFlyout'
import { ToolRail } from './controls/ToolRail'
import { WhiteboardCanvas } from './core/WhiteboardCanvas'

type WhiteboardShellProps = {
  theme: AppTheme
  onToggleTheme: () => void
}

export const WhiteboardShell = ({ theme, onToggleTheme }: WhiteboardShellProps) => {
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
      <div className="relative flex h-full w-full items-center justify-center px-0 py-0">
        <div className={`absolute inset-0 -z-10 ${auraClass} blur-3xl`}></div>
        <WhiteboardCanvas theme={theme} />
      </div>
    </div>
  )
}

