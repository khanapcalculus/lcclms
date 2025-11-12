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

const STORAGE_KEY = 'lcclms_auth'

// Load from localStorage on initialization
const loadFromStorage = (): { user: AuthUser | null; token: string | null } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate that we have both user and token
      if (parsed?.user && parsed?.token) {
        return { user: parsed.user, token: parsed.token }
      }
    }
  } catch (error) {
    console.warn('Failed to load auth from localStorage:', error)
  }
  return { user: null, token: null }
}

// Save to localStorage
const saveToStorage = (user: AuthUser | null, token: string | null) => {
  try {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn('Failed to save auth to localStorage:', error)
  }
}

const initialState = loadFromStorage()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  setAuth: ({ user, token }) => {
    saveToStorage(user, token)
    set(() => ({
      user,
      token,
    }))
  },
  clearAuth: () => {
    saveToStorage(null, null)
    set(() => ({
      user: null,
      token: null,
    }))
  },
}))

