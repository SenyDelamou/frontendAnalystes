import { useState, useEffect, useRef } from 'react'
import { useTheme, THEMES } from '../context/ThemeContext'
import './ThemeSelector.css'

const ThemeSelector = () => {
  const { theme, effectiveTheme, changeTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const themes = [
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
  ]

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

  const currentTheme = themes.find(t => t.id === theme) || themes[0]

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Changer le thème"
        aria-expanded={isOpen}
        title={`Thème: ${currentTheme.name}`}
      >
        <span className="theme-selector-icon">
          {currentTheme.icon}
        </span>
      </button>

      {isOpen && (
        <div className="theme-selector-dropdown">
          <div className="theme-selector-header">
            <span>Choisir un thème</span>
          </div>
          <div className="theme-selector-options">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                className={`theme-selector-option ${theme === themeOption.id ? 'active' : ''}`}
                onClick={() => handleThemeChange(themeOption.id)}
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
                Utilise la préférence système ({effectiveTheme === 'dark' ? 'Sombre' : 'Clair'})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ThemeSelector

