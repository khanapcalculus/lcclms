import mongoose from 'mongoose'
import { env } from './env'

let connectionPromise: Promise<typeof mongoose> | null = null

export const connectDatabase = async () => {
  if (connectionPromise) {
    return connectionPromise
  }

  mongoose.connection.on('connected', () => {
    console.info('📦 MongoDB connected')
  })

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected')
  })

  connectionPromise = mongoose.connect(env.mongoUri, {
    dbName: 'lcclms',
    autoIndex: env.isDevelopment,
  })

  return connectionPromise
}

