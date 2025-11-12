import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: 'admin' | 'tutor' | 'student'
  }
}

export const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthenticatedRequest['user']
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    req.user = payload
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

