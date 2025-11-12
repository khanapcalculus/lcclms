import { Router } from 'express'
import { z } from 'zod'
import {
  createSession,
  listSessionsForStudent,
  listSessionsForTutor,
  updateSessionStatus,
} from './session.service'

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

