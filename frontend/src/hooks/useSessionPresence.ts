import { useCallback, useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

export type PresenceEntry = {
  userId: string
  role: 'admin' | 'tutor' | 'student'
  displayName: string
  joinedAt: number
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export const useSessionPresence = (sessionId: string | undefined) => {
  const { user, token } = useAuthStore()
  const [presence, setPresence] = useState<PresenceEntry[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  const canConnect = Boolean(sessionId && user && token)

  useEffect(() => {
    if (!canConnect) {
      return
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        sessionId,
        userId: user!.id,
        role: user!.role,
        displayName: user!.displayName,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })

    socketInstance.on('presence:update', (entries: PresenceEntry[]) => {
      setPresence(entries.sort((a, b) => a.joinedAt - b.joinedAt))
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setPresence([])
    }
  }, [sessionId, canConnect, token, user])

  const emitCursorMove = useMemo(
    () =>
      socket
        ? (payload: unknown) => {
            socket.emit('cursor:move', payload)
          }
        : undefined,
    [socket]
  )

  const emitWhiteboardOperation = useMemo(
    () =>
      socket
        ? (payload: unknown) => {
            socket.emit('whiteboard:operation', payload)
          }
        : undefined,
    [socket]
  )

  const subscribeCursorMove = useCallback(
    (
      handler: (payload: {
        userId: string
        role: PresenceEntry['role']
        displayName: string
        x: number
        y: number
      }) => void
    ) => {
      if (!socket) {
        return () => {}
      }
      const wrapped = (payload: {
        userId: string
        role: PresenceEntry['role']
        displayName: string
        x: number
        y: number
      }) => handler(payload)
      socket.on('cursor:move', wrapped)
      return () => socket.off('cursor:move', wrapped)
    },
    [socket]
  )

  const subscribeWhiteboardOperation = useCallback(
    (handler: (payload: { userId: string; state: unknown }) => void) => {
      if (!socket) {
        return () => {}
      }
      const wrapped = (payload: { userId: string; state: unknown }) => handler(payload)
      socket.on('whiteboard:operation', wrapped)
      return () => socket.off('whiteboard:operation', wrapped)
    },
    [socket]
  )

  return {
    presence,
    emitCursorMove,
    emitWhiteboardOperation,
    subscribeCursorMove,
    subscribeWhiteboardOperation,
  }
}

