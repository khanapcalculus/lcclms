import { clsx } from 'clsx'
import { useMemo } from 'react'
import type { AppTheme } from '../../../App'
import { useWhiteboardStore } from '../../../store/whiteboardStore'

const SWATCHES = [
  '#f8fafc',
  '#cbd5f5',
  '#60a5fa',
  '#38bdf8',
  '#22d3ee',
  '#f472b6',
  '#f97316',
  '#facc15',
  '#34d399',
  '#94a3b8',
  '#1e293b',
  '#0f172a',
]

const STROKES = [2, 4, 6, 10, 14]

type PalettePanelProps = {
  theme?: AppTheme
}

export const PalettePanel = ({ theme = 'dark' }: PalettePanelProps) => {
  const strokeColor = useWhiteboardStore((state) => state.strokeColor)
  const fillColor = useWhiteboardStore((state) => state.fillColor)
  const strokeWidth = useWhiteboardStore((state) => state.strokeWidth)
  const setStrokeColor = useWhiteboardStore((state) => state.setStrokeColor)
  const setFillColor = useWhiteboardStore((state) => state.setFillColor)
  const setStrokeWidth = useWhiteboardStore((state) => state.setStrokeWidth)

  const strokeLabel = useMemo(() => `${strokeWidth}px`, [strokeWidth])
  const isDark = theme === 'dark'

  const surfaceClass = isDark
    ? 'border-white/12 bg-white/12 text-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.45)]'
    : 'border-slate-200 bg-white text-slate-700 shadow-[0_18px_38px_rgba(148,163,184,0.35)]'

  const labelClass = isDark ? 'text-slate-200/75' : 'text-slate-500/90'

  const swatchBase = isDark
    ? 'border-white/25 bg-white/20 shadow-[0_8px_18px_rgba(15,23,42,0.32)] hover:shadow-[0_12px_26px_rgba(15,23,42,0.35)]'
    : 'border-slate-300/70 bg-white shadow-[0_6px_16px_rgba(148,163,184,0.25)] hover:shadow-[0_10px_22px_rgba(148,163,184,0.28)]'

  const swatchSelected = isDark
    ? 'ring-2 ring-offset-[1px] ring-offset-slate-900/70 ring-sky-300/80'
    : 'ring-2 ring-offset-[1px] ring-offset-white ring-slate-400/80'

  const swatchDefault = isDark ? 'ring-1 ring-white/10' : 'ring-1 ring-slate-200/70'

  const chipClass = isDark
    ? 'border-white/15 bg-white/10 ring-white/10 text-slate-100'
    : 'border-slate-200 bg-white ring-slate-200 text-slate-600'

  const toggleGlowClass = isDark
    ? 'bg-emerald-400/15 text-emerald-100 ring-emerald-300/50'
    : 'bg-emerald-400/25 text-emerald-700 ring-emerald-300/70'

  const toggleSolidClass = isDark ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-600'

  const sliderTrack = isDark ? 'bg-white/25' : 'bg-slate-200/60'

  const weightBase = isDark
    ? 'border-white/12 bg-white/8 hover:bg-white/14'
    : 'border-slate-200 bg-white hover:bg-slate-100/70'

  const weightActive = isDark
    ? 'ring-2 ring-sky-300/70 text-sky-200'
    : 'ring-2 ring-slate-400/70 text-slate-700'

  const weightInactive = isDark
    ? 'ring-1 ring-white/10 text-slate-200'
    : 'ring-1 ring-slate-200 text-slate-500'

  return (
    <div className={clsx('rounded-2xl px-4 py-3 backdrop-blur-2xl', surfaceClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <section className="flex flex-col gap-2">
          <p className={clsx('text-[10px] font-semibold uppercase tracking-[0.24em]', labelClass)}>
            Stroke
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                className={clsx(
                  'relative h-7 w-7 rounded-xl border transition-all duration-150 hover:scale-[1.08]',
                  swatchBase,
                  strokeColor === swatch ? swatchSelected : swatchDefault
                )}
                style={{ background: swatch }}
                onClick={() => setStrokeColor(swatch)}
                title={`Set stroke to ${swatch}`}
              />
            ))}
            <label
              className={clsx(
                'flex h-7 w-20 items-center justify-center rounded-xl border text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-xl hover:ring-sky-300/50',
                chipClass
              )}
            >
              Custom
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
                className="sr-only"
                aria-label="Custom stroke color"
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col items-start gap-2">
          <p className={clsx('text-[10px] font-semibold uppercase tracking-[0.24em]', labelClass)}>
            Fill
          </p>
          <div className="flex items-center gap-2">
            <label
              className={clsx(
                'flex h-8 w-20 items-center justify-center rounded-xl border text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-xl hover:ring-sky-300/50',
                chipClass
              )}
            >
              Tint
              <input
                type="color"
                value={fillColor.startsWith('#') ? fillColor : '#cbd5f5'}
                onChange={(event) => setFillColor(`${event.target.value}90`)}
                className="sr-only"
                aria-label="Fill tint"
              />
            </label>
            <button
              className={clsx(
                'h-8 rounded-xl border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-xl ring-1 transition-colors',
                chipClass,
                fillColor === 'transparent' ? toggleSolidClass : toggleGlowClass
              )}
              onClick={() =>
                setFillColor(fillColor === 'transparent' ? '#cbd5f575' : 'transparent')
              }
            >
              {fillColor === 'transparent' ? 'Solid' : 'Glow'}
            </button>
          </div>
        </section>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={clsx('text-[10px] font-semibold uppercase tracking-[0.24em]', labelClass)}>
          Weight
        </p>
        <div className="flex flex-1 items-center gap-3">
          <input
            type="range"
            min={1}
            max={18}
            value={strokeWidth}
            onChange={(event) => setStrokeWidth(Number(event.target.value))}
            className={clsx(
              'h-1 w-full cursor-pointer appearance-none rounded-full accent-sky-400/90',
              sliderTrack
            )}
          />
          <span
            className={clsx(
              'rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur-xl',
              chipClass
            )}
          >
            {strokeLabel}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {STROKES.map((weight) => (
          <button
            key={weight}
            className={clsx(
              'flex h-7 min-w-[48px] items-center justify-center rounded-lg border text-[11px] font-semibold uppercase tracking-[0.1em] backdrop-blur-xl transition-all',
              weightBase,
              strokeWidth === weight ? weightActive : weightInactive
            )}
            onClick={() => setStrokeWidth(weight)}
          >
            {weight}px
          </button>
        ))}
      </div>
    </div>
  )
}

