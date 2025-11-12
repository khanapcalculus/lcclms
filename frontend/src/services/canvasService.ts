import { httpGet, httpPost } from '../lib/http'

type CanvasState = {
  canvasData: object | null
  version: number
}

export const canvasService = {
  getCanvasState: (sessionId: string) =>
    httpGet<CanvasState>(`/api/sessions/${sessionId}/canvas`),
  
  saveCanvasState: (sessionId: string, canvasData: object) =>
    httpPost(`/api/sessions/${sessionId}/canvas`, { canvasData }),
}

