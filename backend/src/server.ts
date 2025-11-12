import http from 'http'
import { Server } from 'socket.io'
import { createApp } from './app'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import { registerRtcGateway } from './sockets'

const start = async () => {
  await connectDatabase()

  const app = createApp()
  const httpServer = http.createServer(app)

  const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.31.169:5173',
    env.clientOrigin,
    env.clientOrigin?.replace(/\/$/, ''), // Remove trailing slash if present
  ].filter(Boolean)

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (env.clientOrigin === '*' || allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        // Also check if origin + '/' matches
        if (allowedOrigins.includes(origin + '/')) {
          return callback(null, true)
        }
        callback(new Error('Not allowed by CORS'))
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  registerRtcGateway(io)

  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
  httpServer.listen(env.port, host, () => {
    console.info(`🚀 Server listening on ${host}:${env.port}`)
  })

  const shutdown = (signal: string) => {
    console.info(`\nReceived ${signal}, shutting down gracefully`)
    io.close()
    httpServer.close(() => {
      console.info('HTTP server closed')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})

