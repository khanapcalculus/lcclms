import { fabric } from 'fabric'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppTheme } from '../../../App'
import type { PresenceEntry } from '../../../hooks/useSessionPresence'
import { useWhiteboardStore } from '../../../store/whiteboardStore'
import { canvasService } from '../../../services/canvasService'

type FabricObject = fabric.Object | fabric.Line | fabric.Ellipse | fabric.Rect
type CanvasSnapshot = ReturnType<fabric.Canvas['toJSON']>

type RemoteCursor = {
  x: number
  y: number
  displayName: string
  role: PresenceEntry['role']
}

type WhiteboardCanvasProps = {
  theme: AppTheme
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
  emitWhiteboardOperation?: (payload: { state: unknown }) => void
  subscribeWhiteboardOperation?: (
    handler: (payload: { userId: string; state: unknown }) => void
  ) => () => void
}

const roleColorMap: Record<PresenceEntry['role'], string> = {
  admin: 'bg-purple-500/80',
  tutor: 'bg-sky-500/80',
  student: 'bg-emerald-500/80',
}

const configureFabricDefaults = () => {
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.cornerStyle = 'circle'
  fabric.Object.prototype.cornerColor = '#38bdf8'
  fabric.Object.prototype.cornerSize = 14
  fabric.Object.prototype.borderColor = '#38bdf8'
  fabric.Object.prototype.borderScaleFactor = 2
}

configureFabricDefaults()

export const WhiteboardCanvas = ({
  theme,
  sessionId,
  participants,
  currentUserId,
  emitCursorMove,
  subscribeCursorMove,
  emitWhiteboardOperation,
  subscribeWhiteboardOperation,
}: WhiteboardCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElementRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const activeTool = useWhiteboardStore((state) => state.activeTool)
  const strokeColor = useWhiteboardStore((state) => state.strokeColor)
  const fillColor = useWhiteboardStore((state) => state.fillColor)
  const strokeWidth = useWhiteboardStore((state) => state.strokeWidth)
  const pendingImage = useWhiteboardStore((state) => state.pendingImage)
  const setPendingImage = useWhiteboardStore((state) => state.setPendingImage)

  const drawingRef = useRef<{
    object: FabricObject | null
    originX: number
    originY: number
  } | null>(null)
  const isPanningRef = useRef(false)
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null)
  const isApplyingRemoteRef = useRef(false)
  const lastCursorEmitRef = useRef(0)
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({})

  const broadcastSnapshot = useMemo(() => {
    if (!emitWhiteboardOperation) return undefined
    return (snapshot: CanvasSnapshot) => emitWhiteboardOperation({ state: snapshot })
  }, [emitWhiteboardOperation])

  const emitSnapshot = useCallback(() => {
    if (!canvas || !broadcastSnapshot) return
    const snapshot = canvas.toJSON()
    broadcastSnapshot(snapshot)
  }, [canvas, broadcastSnapshot])

  const applyInteractionState = (canvasInstance: fabric.Canvas) => {
    const isDrawing = activeTool === 'pen'
    const isPan = activeTool === 'pan'
    canvasInstance.isDrawingMode = isDrawing
    canvasInstance.selection = activeTool === 'select'
    canvasInstance.skipTargetFind = isPan
    canvasInstance.defaultCursor =
      activeTool === 'pen'
        ? 'crosshair'
        : isPan
          ? 'grab'
          : activeTool === 'eraser'
            ? 'cell'
            : 'default'

    if (canvasInstance.freeDrawingBrush && isDrawing) {
      canvasInstance.freeDrawingBrush.color = strokeColor
      canvasInstance.freeDrawingBrush.width = strokeWidth
    }

    canvasInstance.forEachObject((object) => {
      const isSelectable = activeTool === 'select'
      object.selectable = isSelectable
      object.evented = !isPan
      object.hoverCursor = isSelectable ? 'move' : canvasInstance.defaultCursor
      object.hasControls = isSelectable
      object.lockMovementX = !isSelectable
      object.lockMovementY = !isSelectable
      object.lockRotation = !isSelectable
      object.lockScalingFlip = !isSelectable
      object.lockScalingX = !isSelectable
      object.lockScalingY = !isSelectable
    })

    if (isPan) {
      canvasInstance.discardActiveObject()
      canvasInstance.requestRenderAll()
    } else {
      isPanningRef.current = false
      lastPanPointRef.current = null
      canvasInstance.setCursor(canvasInstance.defaultCursor)
    }
  }

  useEffect(() => {
    if (!canvasElementRef.current || !containerRef.current) return

    const fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: 'rgba(248, 250, 252, 0.28)',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      renderOnAddRemove: false, // Optimize rendering
    })

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = strokeColor
      fabricCanvas.freeDrawingBrush.width = strokeWidth
      fabricCanvas.freeDrawingBrush.limitedToCanvasSize = true
    }
    
    // Optimize for touch/stylus devices
    fabricCanvas.enablePointerEvents = true
    fabricCanvas.allowTouchScrolling = false

    fabricCanvas.setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    // Load saved canvas state if sessionId exists
    if (sessionId) {
      canvasService
        .getCanvasState(sessionId)
        .then(({ canvasData }) => {
          if (canvasData) {
            fabricCanvas.loadFromJSON(canvasData as CanvasSnapshot, () => {
              fabricCanvas.requestRenderAll()
            })
          }
        })
        .catch((err) => {
          console.warn('Could not load saved canvas:', err)
        })
    }

    fabricCanvas.renderAll()
    setCanvas(fabricCanvas)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const { width, height } = entry.contentRect
          fabricCanvas.setDimensions({ width, height })
          fabricCanvas.renderAll()
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      fabricCanvas.dispose()
    }
  }, [])

  useEffect(() => {
    if (!canvas) return
    applyInteractionState(canvas)
  }, [canvas, activeTool, strokeColor, strokeWidth, fillColor])

  useEffect(() => {
    if (!canvas) return

    const handleMouseDown = (event: fabric.IEvent<Event>) => {
      const pointer = canvas.getPointer(event.e as any)
      if (!pointer) return

      if (activeTool === 'pan') {
        canvas.discardActiveObject()
        isPanningRef.current = true
        const nativeEvent = event.e as MouseEvent
        if (nativeEvent && typeof nativeEvent.clientX === 'number') {
          lastPanPointRef.current = {
            x: nativeEvent.clientX,
            y: nativeEvent.clientY,
          }
        } else {
          lastPanPointRef.current = null
        }
        canvas.setCursor('grabbing')
        canvas.requestRenderAll()
        return
      }

      if (activeTool === 'eraser') {
        const target = event.target
        if (target) {
          canvas.remove(target)
          canvas.requestRenderAll()
          emitSnapshot()
        }
        return
      }

      if (!['rectangle', 'ellipse', 'line'].includes(activeTool)) {
        return
      }

      const baseOptions = {
        left: pointer.x,
        top: pointer.y,
        stroke: strokeColor,
        strokeWidth,
        selectable: true,
        objectCaching: false,
      }

      let object: FabricObject | null = null

      if (activeTool === 'rectangle') {
        object = new fabric.Rect({
          ...baseOptions,
          width: 0,
          height: 0,
          rx: 16,
          ry: 16,
          fill: fillColor === 'transparent' ? 'transparent' : fillColor,
        })
      } else if (activeTool === 'ellipse') {
        object = new fabric.Ellipse({
          ...baseOptions,
          rx: 0,
          ry: 0,
          originX: 'center',
          originY: 'center',
          fill: fillColor === 'transparent' ? 'transparent' : fillColor,
        })
      } else if (activeTool === 'line') {
        object = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: strokeColor,
          strokeWidth,
          originX: 'center',
          originY: 'center',
          selectable: true,
        })
      }

      if (object) {
        drawingRef.current = {
          object,
          originX: pointer.x,
          originY: pointer.y,
        }
        canvas.add(object)
        canvas.requestRenderAll()
      }
    }

    const handleMouseMove = (event: fabric.IEvent<Event>) => {
      if (activeTool === 'pan' && isPanningRef.current) {
        const nativeEvent = event.e as MouseEvent
        if (nativeEvent && typeof nativeEvent.clientX === 'number') {
          const lastPoint = lastPanPointRef.current
          if (lastPoint) {
            const deltaX = nativeEvent.clientX - lastPoint.x
            const deltaY = nativeEvent.clientY - lastPoint.y
            if (deltaX !== 0 || deltaY !== 0) {
              canvas.relativePan(new fabric.Point(deltaX, deltaY))
              canvas.requestRenderAll()
            }
          }
          lastPanPointRef.current = { x: nativeEvent.clientX, y: nativeEvent.clientY }
          return
        }

        const pointer = canvas.getPointer(event.e as any)
        if (!pointer) return

        const lastPoint = lastPanPointRef.current
        if (lastPoint) {
          const deltaX = pointer.x - lastPoint.x
          const deltaY = pointer.y - lastPoint.y
          if (deltaX !== 0 || deltaY !== 0) {
            canvas.relativePan(new fabric.Point(deltaX, deltaY))
            canvas.requestRenderAll()
          }
        }
        lastPanPointRef.current = { x: pointer.x, y: pointer.y }
        return
      }

      const pointer = canvas.getPointer(event.e as any)
      if (!pointer) return

      const state = drawingRef.current
      if (!state || !state.object) return

      const { object, originX, originY } = state

      if (object instanceof fabric.Rect) {
        const width = pointer.x - originX
        const height = pointer.y - originY

        object.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width < 0 ? pointer.x : originX,
          top: height < 0 ? pointer.y : originY,
        })
        object.setCoords()
      } else if (object instanceof fabric.Ellipse) {
        const rx = Math.abs(pointer.x - originX) / 2
        const ry = Math.abs(pointer.y - originY) / 2
        const left = originX + (pointer.x - originX) / 2
        const top = originY + (pointer.y - originY) / 2

        object.set({
          rx,
          ry,
          left,
          top,
        })
        object.setCoords()
      } else if (object instanceof fabric.Line) {
        object.set({
          x2: pointer.x,
          y2: pointer.y,
        })
        object.setCoords()
      }
      canvas.requestRenderAll()
    }

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false
        lastPanPointRef.current = null
        canvas.setCursor('grab')
        canvas.requestRenderAll()
        return
      }

      if (drawingRef.current?.object) {
        drawingRef.current = null
        emitSnapshot()
      }
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [canvas, activeTool, strokeColor, strokeWidth, fillColor, emitSnapshot])

  useEffect(() => {
    if (!canvas) return

    const broadcast = () => {
      if (isApplyingRemoteRef.current) return
      emitSnapshot()
      
      // Auto-save to database if sessionId exists
      if (sessionId) {
        const canvasData = canvas.toJSON()
        canvasService.saveCanvasState(sessionId, canvasData).catch((err) => {
          console.warn('Could not save canvas:', err)
        })
      }
    }

    canvas.on('path:created', broadcast)
    canvas.on('object:added', broadcast)
    canvas.on('object:modified', broadcast)
    canvas.on('object:removed', broadcast)

    return () => {
      canvas.off('path:created', broadcast)
      canvas.off('object:added', broadcast)
      canvas.off('object:modified', broadcast)
      canvas.off('object:removed', broadcast)
    }
  }, [canvas, emitSnapshot, sessionId])

  useEffect(() => {
    if (!canvas || !subscribeWhiteboardOperation) return

    const unsubscribe = subscribeWhiteboardOperation(({ userId, state }) => {
      if (userId === currentUserId) return
      isApplyingRemoteRef.current = true
      canvas.loadFromJSON(state as CanvasSnapshot, () => {
        isApplyingRemoteRef.current = false
        canvas.requestRenderAll()
      })
    })

    return unsubscribe
  }, [canvas, subscribeWhiteboardOperation, currentUserId])

  useEffect(() => {
    if (!canvas || !emitCursorMove) return

    const handleMouseMove = (event: fabric.IEvent<Event>) => {
      const now = performance.now()
      if (now - lastCursorEmitRef.current < 50) return
      lastCursorEmitRef.current = now

      const pointer = canvas.getPointer(event.e as any)
      if (!pointer) return

      const width = canvas.getWidth() || containerRef.current?.clientWidth
      const height = canvas.getHeight() || containerRef.current?.clientHeight
      if (!width || !height) return

      emitCursorMove({
        x: pointer.x / width,
        y: pointer.y / height,
      })
    }

    canvas.on('mouse:move', handleMouseMove)
    return () => {
      canvas.off('mouse:move', handleMouseMove)
    }
  }, [canvas, emitCursorMove])

  useEffect(() => {
    if (!canvas || !subscribeCursorMove) return

    const unsubscribe = subscribeCursorMove(({ userId, x, y, displayName, role }) => {
      if (userId === currentUserId) return
      const width = canvas.getWidth() || containerRef.current?.clientWidth || 1
      const height = canvas.getHeight() || containerRef.current?.clientHeight || 1

      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: {
          x: x * width,
          y: y * height,
          displayName,
          role,
        },
      }))
    })

    return unsubscribe
  }, [canvas, subscribeCursorMove, currentUserId])

  useEffect(() => {
    if (!participants) return
    setRemoteCursors((prev) => {
      const allowed = new Set(participants.map((entry) => entry.userId))
      const next: typeof prev = {}
      for (const [id, cursor] of Object.entries(prev)) {
        if (allowed.has(id)) {
          next[id] = cursor
        }
      }
      return next
    })
  }, [participants])

  useEffect(() => {
    if (!canvas || !pendingImage) return

    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      if (typeof url !== 'string') return

      fabric.Image.fromURL(
        url,
        (image: fabric.Image) => {
          const baseWidth = image.getScaledWidth() || image.width || 1
          const baseHeight = image.getScaledHeight() || image.height || 1
          const scaleFactor = Math.min(
            (canvas.getWidth() * 0.5) / baseWidth,
            (canvas.getHeight() * 0.5) / baseHeight,
            1
          )

          image.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            shadow: new fabric.Shadow({
              color: 'rgba(15, 23, 42, 0.35)',
              blur: 25,
              offsetX: 0,
              offsetY: 15,
            }),
          })

          canvas.add(image)
          canvas.setActiveObject(image)
          canvas.requestRenderAll()
          emitSnapshot()
        },
        {
          crossOrigin: 'anonymous',
        }
      )
    }
    reader.readAsDataURL(pendingImage)

    setPendingImage(null)
  }, [canvas, pendingImage, setPendingImage, emitSnapshot])

  useEffect(() => {
    if (!canvas) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length) {
          activeObjects.forEach((object: fabric.Object) => canvas.remove(object))
          canvas.discardActiveObject()
          canvas.requestRenderAll()
          emitSnapshot()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, emitSnapshot])

  const spectrumOverlayClass =
    theme === 'dark'
      ? 'bg-[linear-gradient(120deg,rgba(148,163,184,0.18)_0%,rgba(56,189,248,0.14)_45%,rgba(252,211,77,0.14)_100%)]'
      : 'bg-[linear-gradient(120deg,rgba(148,163,184,0.24)_0%,rgba(59,130,246,0.22)_45%,rgba(251,191,36,0.2)_100%)]'

  const haloOverlayClass =
    theme === 'dark'
      ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_80%_35%,rgba(251,191,36,0.12),transparent_50%)]'
      : 'bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.22),transparent_55%),radial-gradient(circle_at_80%_35%,rgba(251,211,77,0.18),transparent_52%)]'

  const shadeOverlayClass =
    theme === 'dark'
      ? 'bg-[linear-gradient(0deg,transparent_0%,rgba(15,23,42,0.2)_100%)]'
      : 'bg-[linear-gradient(0deg,transparent_0%,rgba(15,23,42,0.08)_100%)]'

  const gridColor = theme === 'dark' ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.6)'

  return (
    <div
      ref={containerRef}
      className={`relative m-0 flex h-full w-full overflow-hidden rounded-none backdrop-blur-[38px] ${
        theme === 'dark'
          ? 'bg-white/8 shadow-[0_35px_95px_rgba(15,23,42,0.55)]'
          : 'bg-white/90 shadow-[0_28px_80px_rgba(148,163,184,0.45)]'
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 ${spectrumOverlayClass} mix-blend-screen`}></div>
      <div className={`pointer-events-none absolute inset-0 ${haloOverlayClass} opacity-90`}></div>
      <div className={`pointer-events-none absolute inset-0 ${shadeOverlayClass}`}></div>
      <canvas ref={canvasElementRef} className="relative z-10 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, ${gridColor} 1px, transparent 1px), linear-gradient(0deg, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        ></div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {Object.entries(remoteCursors).map(([userId, cursor]) => (
          <div
            key={userId}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-xs"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
            }}
          >
            <div
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white ${roleColorMap[cursor.role]}`}
            >
              {cursor.displayName}
            </div>
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/80 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

