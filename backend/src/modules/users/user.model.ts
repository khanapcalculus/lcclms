import { Schema, model, type Document, type Types } from 'mongoose'

export type UserRole = 'admin' | 'tutor' | 'student'

export interface UserDocument extends Document {
  email: string
  passwordHash: string
  role: UserRole
  displayName: string
  avatarUrl?: string
  tutorId?: Types.ObjectId
  assignedStudents: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'tutor', 'student'],
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
)

userSchema.index({ role: 1, tutorId: 1 })

export const UserModel = model<UserDocument>('User', userSchema)

