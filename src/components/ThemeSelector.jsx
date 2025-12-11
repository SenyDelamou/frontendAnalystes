import { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react'
import { useTheme, THEMES } from '../context/ThemeContext'
import './ThemeSelector.css'

const ThemeSelector = () => {
  const { theme, effectiveTheme, changeTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const optionRefs = useRef([])
  const dropdownId = useId()

  const themeOptions = useMemo(() => ([
    {
      id: THEMES.LIGHT,
      name: 'Clair',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: THEMES.DARK,
      name: 'Sombre',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: THEMES.AUTO,
      name: 'Auto',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]), [])

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const nextIndex = themeOptions.findIndex(option => option.id === theme)
    setFocusedIndex(nextIndex >= 0 ? nextIndex : 0)
  }, [isOpen, theme, themeOptions])

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus()
    }
  }, [isOpen, focusedIndex])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex(prev => {
          const next = prev + 1 >= themeOptions.length ? 0 : prev + 1
          return next
        })
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex(prev => {
          const next = prev - 1 < 0 ? themeOptions.length - 1 : prev - 1
          return next
        })
      }

      if ((event.key === 'Enter' || event.key === ' ') && focusedIndex >= 0) {
        event.preventDefault()
        const focusedTheme = themeOptions[focusedIndex]
        if (focusedTheme) {
          handleThemeChange(focusedTheme.id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, focusedIndex, themeOptions])

  const currentTheme = themeOptions.find(t => t.id === theme) || themeOptions[0]

  const handleThemeChange = useCallback((newTheme) => {
    changeTheme(newTheme)
    setIsOpen(false)
  }, [changeTheme])

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className="theme-selector-button"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Changer le thème"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={`${dropdownId}-menu`}
        title={`Thème: ${currentTheme.name}`}
      >
        <span className="theme-selector-icon">
          {currentTheme.icon}
        </span>
      </button>

      {isOpen && (
        <div className="theme-selector-dropdown" role="menu" id={`${dropdownId}-menu`}>
          <div className="theme-selector-header">
            <span>Choisir un thème</span>
          </div>
          <div className="theme-selector-options" role="none">
            {themeOptions.map((themeOption, index) => (
              <button
                key={themeOption.id}
                ref={el => { optionRefs.current[index] = el }}
                className={`theme-selector-option ${theme === themeOption.id ? 'active' : ''}`}
                type="button"
                onClick={() => handleThemeChange(themeOption.id)}
                role="menuitemradio"
                aria-checked={theme === themeOption.id}
                aria-label={`Thème ${themeOption.name}`}
              >
                <span className="theme-option-icon">{themeOption.icon}</span>
                <span className="theme-option-name">{themeOption.name}</span>
                {theme === themeOption.id && (
                  <span className="theme-option-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          {theme === THEMES.AUTO && (
            <div className="theme-selector-info">
              <span className="theme-info-text">
                Utilise la préférence système ({effectiveTheme === THEMES.DARK ? 'Sombre' : 'Clair'})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ThemeSelector

