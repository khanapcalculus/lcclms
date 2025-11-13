import { clsx } from 'clsx'
import {
  Circle,
  Edit3,
  Eraser,
  Hand,
  Images,
  Minus,
  Pencil,
  Pointer,
  Square,
} from 'lucide-react'
import { useRef, type ChangeEvent, type ComponentType } from 'react'
import type { AppTheme } from '../../../App'
import {
  useWhiteboardStore,
  type WhiteboardTool,
} from '../../../store/whiteboardStore'

type ToolRailProps = {
  orientation?: 'vertical' | 'horizontal'
  theme?: AppTheme
}

const TOOL_CONFIG: Array<{
  id: WhiteboardTool
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'select', label: 'Select / Move', icon: Pointer },
  { id: 'pen', label: 'Pen', icon: Pencil },
  { id: 'pen2', label: 'Tablet Pen', icon: Edit3 },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'ellipse', label: 'Ellipse', icon: Circle },
  { id: 'line', label: 'Line', icon: Minus },
]

export const ToolRail = ({
  orientation = 'vertical',
  theme = 'dark',
}: ToolRailProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeTool = useWhiteboardStore((state) => state.activeTool)
  const setTool = useWhiteboardStore((state) => state.setActiveTool)
  const setPendingImage = useWhiteboardStore((state) => state.setPendingImage)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPendingImage(file)
      event.target.value = ''
    }
  }

  const isHorizontal = orientation === 'horizontal'

  const baseButtonClass =
    theme === 'dark'
      ? 'border-white/12 from-white/12 via-white/6 to-white/3 text-slate-100 shadow-[0_12px_25px_rgba(15,23,42,0.4)] hover:shadow-[0_18px_35px_rgba(15,23,42,0.35)]'
      : 'border-slate-200/80 from-white via-slate-100 to-slate-50 text-slate-700 shadow-[0_12px_22px_rgba(148,163,184,0.25)] hover:shadow-[0_18px_30px_rgba(148,163,184,0.25)]'

  const activeRingClass =
    theme === 'dark'
      ? 'ring-2 ring-sky-400/70 backdrop-blur-2xl'
      : 'ring-2 ring-slate-400/70 backdrop-blur-lg'

  const inactiveRingClass =
    theme === 'dark'
      ? 'ring-1 ring-white/10 backdrop-blur-xl'
      : 'ring-1 ring-slate-200/70 backdrop-blur'

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-[2rem]',
        isHorizontal
          ? 'flex-row bg-white/10 px-5 py-4 backdrop-blur-2xl'
          : 'w-20 shrink-0 flex-col justify-between bg-transparent p-4'
      )}
    >
      <div className={clsx('flex gap-1.5', isHorizontal ? 'flex-row' : 'flex-col')}>
        {TOOL_CONFIG.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br transition-all duration-200',
                baseButtonClass,
                activeTool === tool.id ? activeRingClass : inactiveRingClass
              )}
              onClick={() => setTool(tool.id)}
              title={tool.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          )
        })}
      </div>

      <div
        className={clsx(
          'flex items-center',
          isHorizontal ? 'gap-2 pl-4' : 'flex-col gap-2'
        )}
      >
        <button
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br transition-all duration-200',
            baseButtonClass,
            inactiveRingClass
          )}
          onClick={handleImageClick}
          title="Upload image"
        >
          <Images className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
    </div>
  )
}

