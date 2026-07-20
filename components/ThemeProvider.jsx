'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext({ theme: 'dark', toggle: () => {} })
export const useTheme = () => useContext(ThemeCtx)

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const stored = localStorage.getItem('insee_theme') || 'dark'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('insee_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}
