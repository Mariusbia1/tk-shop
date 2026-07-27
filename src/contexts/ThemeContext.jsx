import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('atelier-naya-theme-v2')
    if (savedTheme) return savedTheme
    return 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('atelier-naya-theme-v2', theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light')

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
