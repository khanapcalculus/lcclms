import { httpPost } from '../lib/http'
import type { AuthUser } from '../store/authStore'

type AuthResponse = {
  user: AuthUser
  token: string
}

export const authService = {
  login: (payload: { email: string; password: string }) =>
    httpPost<AuthResponse>('/api/auth/login', payload, { skipAuth: true }),
  register: (payload: {
    email: string
    password: string
    displayName: string
    role: 'admin' | 'tutor' | 'student'
    tutorId?: string
  }) => httpPost<AuthResponse>('/api/auth/register', payload, { skipAuth: true }),
}

