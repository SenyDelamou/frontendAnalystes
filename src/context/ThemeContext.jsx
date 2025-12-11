import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

const isBrowserEnvironment = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const sanitizeTheme = (value) => {
  if (!value) return THEMES.AUTO
  return Object.values(THEMES).includes(value) ? value : THEMES.AUTO
}

// Obtenir la préférence système
const getSystemTheme = () => {
  if (!isBrowserEnvironment()) {
    return THEMES.LIGHT
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK
  }
  return THEMES.LIGHT
}

// Obtenir le thème effectif (résout 'auto' en thème système)
const getEffectiveTheme = (theme) => {
  if (theme === THEMES.AUTO) {
    return getSystemTheme()
  }
  return theme
}

const applyThemeToDocument = (theme, effectiveTheme) => {
  if (!isBrowserEnvironment()) return

  const root = document.documentElement
  root.setAttribute('data-theme', effectiveTheme)
  root.style.setProperty('color-scheme', effectiveTheme === THEMES.DARK ? 'dark' : 'light')

  if (document.body) {
    document.body.setAttribute('data-theme', effectiveTheme)
    document.body.classList.toggle('is-dark-theme', effectiveTheme === THEMES.DARK)
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const computedColor = getComputedStyle(root).getPropertyValue('--bg-primary')?.trim()
    if (computedColor) {
      metaThemeColor.setAttribute('content', computedColor)
    }
  }
}

const readStoredTheme = () => {
  if (!isBrowserEnvironment()) return null

  try {
    return localStorage.getItem('theme')
  } catch (error) {
    console.warn('Impossible de lire le thème dans le stockage local:', error)
    return null
  }
}

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = sanitizeTheme(readStoredTheme())
    const initialEffectiveTheme = getEffectiveTheme(storedTheme)
    applyThemeToDocument(storedTheme, initialEffectiveTheme)
    return storedTheme
  })

  const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveTheme(theme))

  // Écouter les changements de préférence système quand le thème est sur "auto"
  useEffect(() => {
    if (!isBrowserEnvironment() || theme !== THEMES.AUTO) return undefined

    if (!window.matchMedia) {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event) => {
      const matches = event?.matches ?? mediaQuery.matches
      const nextEffectiveTheme = matches ? THEMES.DARK : THEMES.LIGHT
      setEffectiveTheme(nextEffectiveTheme)
      applyThemeToDocument(THEMES.AUTO, nextEffectiveTheme)
    }

    handleChange()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [theme])

  // Mettre à jour le thème effectif quand le thème change
  useEffect(() => {
    const newEffectiveTheme = getEffectiveTheme(theme)
    setEffectiveTheme(newEffectiveTheme)
    applyThemeToDocument(theme, newEffectiveTheme)

    if (!isBrowserEnvironment()) return

    try {
      localStorage.setItem('theme', theme)
    } catch (error) {
      console.warn('Impossible d\'enregistrer le thème dans le stockage local:', error)
    }
  }, [theme])

  // Synchroniser les changements de thème entre plusieurs onglets/fenêtres
  useEffect(() => {
    if (!isBrowserEnvironment()) return undefined

    const handleStorage = (event) => {
      if (event.key !== 'theme') return

      const nextTheme = sanitizeTheme(event.newValue)
      setTheme(prev => (prev === nextTheme ? prev : nextTheme))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const changeTheme = useCallback((newTheme) => {
    setTheme(sanitizeTheme(newTheme))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === THEMES.AUTO) {
        return getSystemTheme() === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
      }
      return prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    })
  }, [])

  const value = useMemo(() => ({
    theme,
    effectiveTheme,
    resolvedTheme: effectiveTheme,
    isAuto: theme === THEMES.AUTO,
    isDark: effectiveTheme === THEMES.DARK,
    changeTheme,
    toggleTheme,
    themes: THEMES
  }), [theme, effectiveTheme, changeTheme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

