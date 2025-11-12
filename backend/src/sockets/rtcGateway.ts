import type { Server, Socket } from 'socket.io'
import { env } from '../config/env'

type PresenceState = {
  userId: string
  role: 'admin' | 'tutor' | 'student'
  displayName: string
  joinedAt: number
}

type SessionPresence = Map<string, PresenceState>

const sessionPresenceMap = new Map<string, SessionPresence>()

const getOrCreateSessionPresence = (sessionId: string): SessionPresence => {
  let sessionPresence = sessionPresenceMap.get(sessionId)
  if (!sessionPresence) {
    sessionPresence = new Map()
    sessionPresenceMap.set(sessionId, sessionPresence)
  }
  return sessionPresence
}

const broadcastPresence = (io: Server, sessionId: string) => {
  const sessionPresence = getOrCreateSessionPresence(sessionId)
  io.to(sessionId).emit('presence:update', Array.from(sessionPresence.values()))
}

const handleDisconnect = (io: Server, socket: Socket) => {
  const sessionId = socket.data.sessionId as string | undefined
  const userId = socket.data.userId as string | undefined
  if (!sessionId || !userId) {
    return
  }

  const sessionPresence = sessionPresenceMap.get(sessionId)
  if (!sessionPresence) {
    return
  }

  sessionPresence.delete(userId)
  if (sessionPresence.size === 0) {
    sessionPresenceMap.delete(sessionId)
  }

  broadcastPresence(io, sessionId)
}

export const registerRtcGateway = (io: Server) => {
  io.use((socket, next) => {
    const { sessionId, userId, role, displayName } = socket.handshake.auth ?? {}

    if (!sessionId || !userId) {
      return next(new Error('sessionId and userId are required'))
    }

    socket.data.sessionId = sessionId
    socket.data.userId = userId
    socket.data.role = role ?? 'student'
    socket.data.displayName = displayName ?? 'Anonymous'

    return next()
  })

  io.on('connection', (socket) => {
    const sessionId = socket.data.sessionId as string
    const userId = socket.data.userId as string
    const role = socket.data.role as PresenceState['role']
    const displayName = socket.data.displayName as string

    socket.join(sessionId)

    const sessionPresence = getOrCreateSessionPresence(sessionId)
    sessionPresence.set(userId, {
      userId,
      role,
      displayName,
      joinedAt: Date.now(),
    })

    broadcastPresence(io, sessionId)

    socket.on('cursor:move', (payload) => {
      socket.to(sessionId).emit('cursor:move', {
        userId,
        role,
        displayName,
        ...payload,
      })
    })

    socket.on('whiteboard:operation', (payload) => {
      socket.to(sessionId).emit('whiteboard:operation', {
        userId,
        ...payload,
      })
    })

    socket.on('chat:message', (payload) => {
      io.to(sessionId).emit('chat:message', {
        userId,
        displayName,
        role,
        sentAt: new Date().toISOString(),
        ...payload,
      })
    })

    socket.on('disconnect', () => handleDisconnect(io, socket))
  })

  io.engine.on('connection_error', (err) => {
    if (!env.isProduction) {
      console.error('Socket connection error', err)
    }
  })
}

