import { Router } from 'express'
import { z } from 'zod'
import { assignStudentsToTutor, listStudents, listTutorsWithAssignments } from './user.service'

export const userRouter = Router()

userRouter.get('/tutors', async (_req, res, next) => {
  try {
    const tutors = await listTutorsWithAssignments()
    res.json(tutors)
  } catch (error) {
    next(error)
  }
})

userRouter.get('/students', async (req, res, next) => {
  try {
    const { tutorId } = req.query as { tutorId?: string }
    const filter = tutorId ? { tutorId } : undefined
    const students = await listStudents(filter)
    res.json(students)
  } catch (error) {
    next(error)
  }
})

const assignSchema = z.object({
  tutorId: z.string(),
  studentIds: z.array(z.string()).min(1),
})

userRouter.post('/tutors/assign', async (req, res, next) => {
  try {
    const payload = assignSchema.parse(req.body)
    const tutor = await assignStudentsToTutor(payload.tutorId, payload.studentIds)
    res.json(tutor)
  } catch (error) {
    next(error)
  }
})

