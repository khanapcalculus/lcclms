import { Types } from 'mongoose'
import { SessionModel, type SessionDocument, type SessionStatus } from './session.model'

export const createSession = async (params: {
  title: string
  description?: string | undefined
  tutorId: string
  studentIds: string[]
  scheduledStart: Date
  scheduledEnd: Date
  meetingUrl?: string | undefined
  recurrenceRule?: string | undefined
  createdBy: string
}) => {
  const overlap = await SessionModel.findOne({
    tutorId: new Types.ObjectId(params.tutorId),
    scheduledStart: { $lt: params.scheduledEnd },
    scheduledEnd: { $gt: params.scheduledStart },
    status: { $in: ['scheduled', 'live'] as SessionStatus[] },
  }).lean()

  if (overlap) {
    throw new Error('Tutor already has a session scheduled in this time range')
  }

  const session = new SessionModel({
    ...params,
    tutorId: new Types.ObjectId(params.tutorId),
    studentIds: params.studentIds.map((id) => new Types.ObjectId(id)),
    createdBy: new Types.ObjectId(params.createdBy),
  })

  await session.save()
  return session.toObject()
}

export const listSessionsForTutor = (
  tutorId: string,
  range?: { start?: Date | undefined; end?: Date | undefined }
) => {
  const query: Record<string, unknown> = {
    tutorId: new Types.ObjectId(tutorId),
  }

  if (range?.start || range?.end) {
    query.scheduledStart = {}
    if (range.start) {
      ;(query.scheduledStart as Record<string, unknown>).$gte = range.start
    }
    if (range.end) {
      ;(query.scheduledStart as Record<string, unknown>).$lte = range.end
    }
  }

  return SessionModel.find(query).sort({ scheduledStart: 1 }).lean()
}

export const listSessionsForStudent = (studentId: string) => {
  return SessionModel.find({
    studentIds: new Types.ObjectId(studentId),
    status: { $in: ['scheduled', 'live'] },
  })
    .sort({ scheduledStart: 1 })
    .lean()
}

export const updateSessionStatus = (sessionId: string, status: SessionStatus) => {
  return SessionModel.findByIdAndUpdate(sessionId, { status }, { new: true }).lean()
}

