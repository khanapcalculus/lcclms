import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'PORT must be a positive integer',
    })
    .default('3000' as unknown as number),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CLIENT_ORIGIN: z.string().url().optional(),
})

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
})

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

const { NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN } = parsed.data

export const env = {
  nodeEnv: NODE_ENV,
  port: typeof PORT === 'number' ? PORT : Number(PORT),
  mongoUri: MONGODB_URI,
  jwtSecret: JWT_SECRET,
  clientOrigin: CLIENT_ORIGIN,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
}

