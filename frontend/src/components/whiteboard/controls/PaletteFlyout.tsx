import { Droplet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AppTheme } from '../../../App'
import { PalettePanel } from './PalettePanel'

type PaletteFlyoutProps = {
  theme?: AppTheme
}

export const PaletteFlyout = ({ theme = 'dark' }: PaletteFlyoutProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex h-14 w-14 items-center justify-center rounded-2xl border ${
          theme === 'dark'
            ? 'border-white/15 bg-white/10 text-slate-100 shadow-[0_18px_35px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_45px_rgba(15,23,42,0.45)]'
            : 'border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_12px_30px_rgba(148,163,184,0.35)] hover:shadow-[0_18px_36px_rgba(148,163,184,0.3)]'
        } backdrop-blur-xl transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70`}
        aria-expanded={open}
        aria-controls="palette-flyout"
      >
        <Droplet className="h-6 w-6 transition-transform duration-200 group-hover:rotate-12" />
      </button>

      {open && (
        <div
          id="palette-flyout"
          className="absolute left-full top-1/2 z-30 ml-4 -translate-y-[62%]"
        >
          <PalettePanel theme={theme} />
        </div>
      )}
    </div>
  )
}

