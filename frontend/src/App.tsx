import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SessionPage } from './pages/SessionPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { TutorDashboard } from './pages/TutorDashboard'
import { WhiteboardShell } from './components/whiteboard/WhiteboardShell'
import { useAuthStore } from './store/authStore'

export type AppTheme = 'dark' | 'light'

function App() {
  const [theme, setTheme] = useState<AppTheme>('dark')
  
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.toggle('theme-light', theme === 'light')
    root.classList.toggle('theme-dark', theme === 'dark')
    body.classList.toggle('theme-light', theme === 'light')
    body.classList.toggle('theme-dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth roles={['admin']}>
              <DashboardLayout theme={theme} onToggleTheme={toggleTheme}>
                <AdminDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/tutor"
          element={
            <RequireAuth roles={['tutor']}>
              <DashboardLayout theme={theme} onToggleTheme={toggleTheme}>
                <TutorDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/student"
          element={
            <RequireAuth roles={['student']}>
              <DashboardLayout theme={theme} onToggleTheme={toggleTheme}>
                <StudentDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/session/:sessionId"
          element={
            <RequireAuth roles={['admin', 'tutor', 'student']}>
              <SessionPage theme={theme} onToggleTheme={toggleTheme} />
            </RequireAuth>
          }
        />

        <Route
          path="/whiteboard"
          element={
            <RequireAuth>
              <WhiteboardShell theme={theme} onToggleTheme={toggleTheme} />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const HomeRedirect = () => {
  const { user } = useAuthStore()
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const roleDashboard: Record<typeof user.role, string> = {
    admin: '/admin',
    tutor: '/tutor',
    student: '/student',
  }

  return <Navigate to={roleDashboard[user.role]} replace />
}

type RequireAuthProps = {
  roles?: Array<'admin' | 'tutor' | 'student'>
  children: ReactNode
}

const RequireAuth = ({ roles, children }: RequireAuthProps) => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    const roleDashboard: Record<typeof user.role, string> = {
      admin: '/admin',
      tutor: '/tutor',
      student: '/student',
    }
    return <Navigate to={roleDashboard[user.role]} replace />
  }

  return <>{children}</>
}

export default App
