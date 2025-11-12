import { Schema, model, type Document, type Types } from 'mongoose'

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'

export interface SessionDocument extends Document {
  title: string
  description?: string
  tutorId: Types.ObjectId
  studentIds: Types.ObjectId[]
  scheduledStart: Date
  scheduledEnd: Date
  meetingUrl?: string
  recurrenceRule?: string
  status: SessionStatus
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const sessionSchema = new Schema<SessionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    scheduledStart: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    meetingUrl: {
      type: String,
    },
    recurrenceRule: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

sessionSchema.index({ tutorId: 1, scheduledStart: 1 })
sessionSchema.index({ studentIds: 1, scheduledStart: 1 })

export const SessionModel = model<SessionDocument>('Session', sessionSchema)

