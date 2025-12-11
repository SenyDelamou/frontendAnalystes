import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Thèmes disponibles
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// Obtenir la préférence système
const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

// Obtenir le thème effectif (résout 'auto' en thème système)
const getEffectiveTheme = (theme) => {
  if (theme === THEMES.AUTO) {
    return getSystemTheme()
  }
  return theme
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || THEMES.AUTO
  })

  const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveTheme(theme))

  // Écouter les changements de préférence système
  useEffect(() => {
    if (theme !== THEMES.AUTO) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newEffectiveTheme = getSystemTheme()
      setEffectiveTheme(newEffectiveTheme)
      document.documentElement.setAttribute('data-theme', newEffectiveTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Mettre à jour le thème effectif quand le thème change
  useEffect(() => {
    const newEffectiveTheme = getEffectiveTheme(theme)
    setEffectiveTheme(newEffectiveTheme)
    document.documentElement.setAttribute('data-theme', newEffectiveTheme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    // Toggle entre light et dark (ignore auto)
    setTheme(prev => {
      if (prev === THEMES.AUTO) {
        return getSystemTheme() === 'dark' ? THEMES.LIGHT : THEMES.DARK
      }
      return prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    })
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      effectiveTheme,
      changeTheme, 
      toggleTheme,
      themes: THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

