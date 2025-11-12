import bcrypt from 'bcrypt'
import { Types } from 'mongoose'
import type { UserDocument, UserRole } from './user.model'
import { UserModel } from './user.model'

const SALT_ROUNDS = 10

export const createUser = async (params: {
  email: string
  password: string
  displayName: string
  role: UserRole
  tutorId?: string | undefined
}): Promise<UserDocument> => {
  const existingUser = await UserModel.findOne({ email: params.email }).lean()
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS)

  const user = new UserModel({
    email: params.email,
    displayName: params.displayName,
    role: params.role,
    passwordHash,
    tutorId: params.tutorId ? new Types.ObjectId(params.tutorId) : undefined,
  })

  await user.save()
  return user
}

export const assignStudentsToTutor = async (tutorId: string, studentIds: string[]) => {
  const tutor = await UserModel.findById(tutorId)
  if (!tutor || tutor.role !== 'tutor') {
    throw new Error('Tutor not found')
  }

  const students = await UserModel.find({
    _id: { $in: studentIds },
    role: 'student',
  })

  if (students.length !== studentIds.length) {
    throw new Error('One or more students were not found')
  }

  await UserModel.updateMany(
    { _id: { $in: studentIds } },
    {
      $set: {
        tutorId: tutor._id,
      },
    }
  )

  tutor.assignedStudents = studentIds.map((id) => new Types.ObjectId(id))
  await tutor.save()

  return tutor.toObject()
}

export const findUserByEmail = (email: string) => {
  return UserModel.findOne({ email }).select('+passwordHash')
}

export const listTutorsWithAssignments = () => {
  return UserModel.find({ role: 'tutor' })
    .populate('assignedStudents', 'displayName email')
    .lean()
}

export const listStudents = (filter?: { tutorId?: string | undefined }) => {
  const query: Record<string, unknown> = { role: 'student' }
  if (filter?.tutorId) {
    query.tutorId = new Types.ObjectId(filter.tutorId)
  }
  return UserModel.find(query).lean()
}

