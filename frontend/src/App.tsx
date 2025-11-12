import { useEffect, useState } from 'react'
import { WhiteboardShell } from './components/whiteboard/WhiteboardShell'

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
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <WhiteboardShell theme={theme} onToggleTheme={toggleTheme} />
    </div>
  )
}

export default App
