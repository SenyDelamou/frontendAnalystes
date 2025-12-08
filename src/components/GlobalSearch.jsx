import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './GlobalSearch.css'

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState({
    resources: [],
    projects: [],
    challenges: [],
    users: []
  })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => searchRef.current?.focus(), 100)
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchTerm('')
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ resources: [], projects: [], challenges: [], users: [] })
      return
    }

    const term = searchTerm.toLowerCase()
    
    // Search resources
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const resources = articles
      .filter(a => 
        a.title?.toLowerCase().includes(term) ||
        a.excerpt?.toLowerCase().includes(term) ||
        a.tags?.some(tag => tag.toLowerCase().includes(term))
      )
      .slice(0, 5)

    // Search projects
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const filteredProjects = projects
      .filter(p => 
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      )
      .slice(0, 5)

    // Search challenges
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    const filteredChallenges = challenges
      .filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      )
      .slice(0, 5)

    // Search users
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const filteredUsers = users
      .filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      )
      .slice(0, 5)

    setResults({
      resources,
      projects: filteredProjects,
      challenges: filteredChallenges,
      users: filteredUsers
    })
    setSelectedIndex(-1)
  }, [searchTerm])

  const handleResultClick = (type, id) => {
    let path = ''
    switch (type) {
      case 'resource':
        path = `/articles/${id}`
        break
      case 'project':
        path = `/projects`
        break
      case 'challenge':
        path = `/challenges`
        break
      case 'user':
        path = `/profiles/${id}`
        break
      default:
        return
    }
    navigate(path)
    setIsOpen(false)
    setSearchTerm('')
  }

  const allResults = [
    ...results.resources.map(r => ({ ...r, type: 'resource' })),
    ...results.projects.map(p => ({ ...p, type: 'project' })),
    ...results.challenges.map(c => ({ ...c, type: 'challenge' })),
    ...results.users.map(u => ({ ...u, type: 'user' }))
  ]

  const hasResults = allResults.length > 0

  return (
    <>
      <button
        className="global-search-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Recherche globale"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="search-shortcut">Ctrl+K</span>
      </button>

      {isOpen && (
        <div className="global-search-overlay" onClick={() => setIsOpen(false)}>
          <div className="global-search-modal" onClick={(e) => e.stopPropagation()} ref={searchRef}>
            <div className="global-search-input-container">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="global-search-input"
                placeholder="Rechercher des ressources, projets, défis, utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Effacer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="m15 9-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="global-search-results">
                {!hasResults ? (
                  <div className="search-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun résultat trouvé</p>
                    <span className="search-hint">Essayez avec d'autres mots-clés</span>
                  </div>
                ) : (
                  <>
                    {results.resources.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">
                          <span className="search-section-icon">📚</span>
                          <span className="search-section-title">Ressources</span>
                        </div>
                        {results.resources.map((resource, idx) => {
                          const globalIdx = idx
                          return (
                            <div
                              key={resource.id}
                              className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                              onClick={() => handleResultClick('resource', resource.id)}
                            >
                              <div className="search-result-icon">📄</div>
                              <div className="search-result-content">
                                <div className="search-result-title">{resource.title}</div>
                                <div className="search-result-meta">{resource.category}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {results.projects.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">
                          <span className="search-section-icon">💼</span>
                          <span className="search-section-title">Projets</span>
                        </div>
                        {results.projects.map((project, idx) => {
                          const globalIdx = results.resources.length + idx
                          return (
                            <div
                              key={project.id}
                              className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                              onClick={() => handleResultClick('project', project.id)}
                            >
                              <div className="search-result-icon">📊</div>
                              <div className="search-result-content">
                                <div className="search-result-title">{project.title}</div>
                                <div className="search-result-meta">{project.status}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {results.challenges.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">
                          <span className="search-section-icon">🏆</span>
                          <span className="search-section-title">Défis</span>
                        </div>
                        {results.challenges.map((challenge, idx) => {
                          const globalIdx = results.resources.length + results.projects.length + idx
                          return (
                            <div
                              key={challenge.id}
                              className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                              onClick={() => handleResultClick('challenge', challenge.id)}
                            >
                              <div className="search-result-icon">🎯</div>
                              <div className="search-result-content">
                                <div className="search-result-title">{challenge.title}</div>
                                <div className="search-result-meta">{challenge.status}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {results.users.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">
                          <span className="search-section-icon">👤</span>
                          <span className="search-section-title">Utilisateurs</span>
                        </div>
                        {results.users.map((user, idx) => {
                          const globalIdx = results.resources.length + results.projects.length + results.challenges.length + idx
                          return (
                            <div
                              key={user.id}
                              className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                              onClick={() => handleResultClick('user', user.id)}
                            >
                              <div className="search-result-icon">👥</div>
                              <div className="search-result-content">
                                <div className="search-result-title">{user.name}</div>
                                <div className="search-result-meta">{user.email}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {!searchTerm && (
              <div className="search-placeholder">
                <div className="search-placeholder-icon">🔍</div>
                <p>Recherchez des ressources, projets, défis ou utilisateurs</p>
                <div className="search-shortcuts">
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd> pour ouvrir
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd> pour fermer
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSearch

