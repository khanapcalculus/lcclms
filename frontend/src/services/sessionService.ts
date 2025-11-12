import { httpGet, httpPatch, httpPost } from '../lib/http'

export type Session = {
  _id: string
  title: string
  description?: string
  tutorId: string
  studentIds: string[]
  scheduledStart: string
  scheduledEnd: string
  meetingUrl?: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
}

export const sessionService = {
  create: (payload: {
    title: string
    description?: string
    tutorId: string
    studentIds: string[]
    scheduledStart: string
    scheduledEnd: string
    meetingUrl?: string
    recurrenceRule?: string
    createdBy: string
  }) => httpPost<Session>('/api/sessions', payload),

  listForTutor: (tutorId: string, range?: { start?: string; end?: string }) => {
    const params = new URLSearchParams()
    if (range?.start) params.set('start', range.start)
    if (range?.end) params.set('end', range.end)
    const query = params.toString()
    const suffix = query ? `?${query}` : ''
    return httpGet<Session[]>(`/api/sessions/tutor/${tutorId}${suffix}`)
  },

  listForStudent: (studentId: string) =>
    httpGet<Session[]>(`/api/sessions/student/${studentId}`),

  updateStatus: (sessionId: string, status: Session['status']) =>
    httpPatch<Session>(`/api/sessions/${sessionId}/status`, { status }),
}

