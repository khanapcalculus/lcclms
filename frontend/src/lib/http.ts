import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

type FetchOptions = RequestInit & {
  skipAuth?: boolean
}

export async function http<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token } = useAuthStore.getState()
  const headers = new Headers(options.headers)

  headers.set('Content-Type', 'application/json')
  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = await response.json()
      if (data?.message) {
        message = data.message
      }
    } catch (error) {
      // ignore parse error
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const httpGet = <T>(path: string) => http<T>(path)

export const httpPost = <T>(path: string, body: unknown, options: FetchOptions = {}) =>
  http<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) })

export const httpPatch = <T>(path: string, body: unknown, options: FetchOptions = {}) =>
  http<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) })

