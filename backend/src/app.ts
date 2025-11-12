import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { env } from './config/env'
import { apiRouter } from './routes'

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigin ?? '*',
      credentials: true,
    })
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api', apiRouter)

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` })
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', issues: error.issues })
    }

    if (error instanceof Error) {
      console.error('Unhandled error', error)
      return res.status(400).json({ message: error.message })
    }

    console.error('Unknown error', error)
    return res.status(500).json({ message: 'Internal server error' })
  })

  return app
}

