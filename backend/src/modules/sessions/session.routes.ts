import { Router } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import {
  createSession,
  listSessionsForStudent,
  listSessionsForTutor,
  updateSessionStatus,
} from './session.service'
import { CanvasStateModel } from './canvas.model'
import type { AuthenticatedRequest } from '../../middlewares/authGuard'

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  tutorId: z.string(),
  studentIds: z.array(z.string()).min(1),
  scheduledStart: z.string().transform((val) => new Date(val)),
  scheduledEnd: z.string().transform((val) => new Date(val)),
  meetingUrl: z.string().url().optional(),
  recurrenceRule: z.string().optional(),
  createdBy: z.string(),
})

const statusSchema = z.object({
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
})

export const sessionRouter = Router()

sessionRouter.post('/', async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body)
    const session = await createSession(payload)
    res.status(201).json(session)
  } catch (error) {
    next(error)
  }
})

sessionRouter.get('/tutor/:tutorId', async (req, res, next) => {
  try {
    const { tutorId } = req.params
    const { start, end } = req.query
    const sessions = await listSessionsForTutor(tutorId, {
      start: start ? new Date(start as string) : undefined,
      end: end ? new Date(end as string) : undefined,
    })
    res.json(sessions)
  } catch (error) {
    next(error)
  }
})

sessionRouter.get('/student/:studentId', async (req, res, next) => {
  try {
    const { studentId } = req.params
    const sessions = await listSessionsForStudent(studentId)
    res.json(sessions)
  } catch (error) {
    next(error)
  }
})

sessionRouter.patch('/:sessionId/status', async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const payload = statusSchema.parse(req.body)
    const session = await updateSessionStatus(sessionId, payload.status)
    res.json(session)
  } catch (error) {
    next(error)
  }
})

// Get canvas state for a session
sessionRouter.get('/:sessionId/canvas', async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const canvasState = await CanvasStateModel.findOne({ sessionId: new Types.ObjectId(sessionId) }).lean()
    if (!canvasState) {
      return res.json({ canvasData: null, version: 0 })
    }
    res.json({ canvasData: canvasState.canvasData, version: canvasState.version })
  } catch (error) {
    next(error)
  }
})

// Save canvas state for a session
sessionRouter.post('/:sessionId/canvas', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sessionId } = req.params
    const { canvasData } = req.body
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const updated = await CanvasStateModel.findOneAndUpdate(
      { sessionId: new Types.ObjectId(sessionId) },
      {
        canvasData,
        lastModifiedBy: new Types.ObjectId(userId),
        $inc: { version: 1 },
      },
      { upsert: true, new: true }
    )

    res.json({ version: updated.version })
  } catch (error) {
    next(error)
  }
})

