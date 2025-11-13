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

  const io = new Server(httpServer, {
    cors: {
      origin: true, // Allow all origins
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  registerRtcGateway(io)

  const host = '0.0.0.0' // Listen on all network interfaces for tablet access
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
  if (error instanceof Error) {
    console.error('Error details:', error.message)
    console.error('Stack:', error.stack)
  }
  process.exit(1)
})

