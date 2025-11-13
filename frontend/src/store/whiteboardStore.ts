import { create } from 'zustand'

export type WhiteboardTool =
  | 'select'
  | 'pan'
  | 'pen'
  | 'eraser'
  | 'rectangle'
  | 'ellipse'
  | 'line'

interface WhiteboardState {
  activeTool: WhiteboardTool
  strokeColor: string
  fillColor: string
  strokeWidth: number
  pendingImage: File | null
  setActiveTool: (tool: WhiteboardTool) => void
  setStrokeColor: (color: string) => void
  setFillColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setPendingImage: (file: File | null) => void
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  activeTool: 'select',
  strokeColor: '#0f172a',
  fillColor: '#cbd5f575',
  strokeWidth: 3,
  pendingImage: null,
  setActiveTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setPendingImage: (file) => set({ pendingImage: file }),
}))

