import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import { createUser, findUserByEmail } from '../users/user.service'
import type { UserRole } from '../users/user.model'

export const registerUser = async (params: {
  email: string
  password: string
  displayName: string
  role: UserRole
  tutorId?: string | undefined
}) => {
  const user = await createUser(params)
  const id = user.id
  const publicUser = {
    id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }
  return {
    user: publicUser,
    token: createJwtToken({ id, role: user.role }),
  }
}

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  const id = user.id
  const publicUser = {
    id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }

  return {
    user: publicUser,
    token: createJwtToken({ id, role: user.role }),
  }
}

const createJwtToken = (payload: { id: string; role: UserRole }) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '12h',
  })
}

