import { httpGet, httpPost } from '../lib/http'

export type TutorWithStudents = {
  _id: string
  displayName: string
  email: string
  assignedStudents?: Array<{
    _id: string
    displayName: string
    email: string
  }>
}

export const userService = {
  listTutors: () => httpGet<TutorWithStudents[]>('/api/users/tutors'),
  listStudents: (tutorId?: string) =>
    httpGet<Array<{ _id: string; displayName: string; email: string }>>(
      tutorId ? `/api/users/students?tutorId=${tutorId}` : '/api/users/students'
    ),
  assignStudents: (payload: { tutorId: string; studentIds: string[] }) =>
    httpPost('/api/users/tutors/assign', payload),
}

