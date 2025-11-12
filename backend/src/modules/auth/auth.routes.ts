import { Router } from 'express'
import { z } from 'zod'
import { loginUser, registerUser } from './auth.service'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  role: z.enum(['admin', 'tutor', 'student']),
  tutorId: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRouter = Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body)
    const result = await registerUser(payload)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body)
    const result = await loginUser(payload.email, payload.password)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

