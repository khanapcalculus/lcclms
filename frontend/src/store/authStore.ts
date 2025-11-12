import { create } from 'zustand'

type UserRole = 'admin' | 'tutor' | 'student'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatarUrl?: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  setAuth: (payload: { user: AuthUser; token: string }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: ({ user, token }) =>
    set(() => ({
      user,
      token,
    })),
  clearAuth: () =>
    set(() => ({
      user: null,
      token: null,
    })),
}))

