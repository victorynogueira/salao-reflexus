'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dark-mode')
    const isDark = stored ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('dark-mode', String(newValue))
      document.documentElement.classList.toggle('dark', newValue)
      return newValue
    })
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
