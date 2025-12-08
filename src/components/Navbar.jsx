import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../context/FavoritesContext'
import GlobalSearch from './GlobalSearch'
import { getFilteredNavbarLinks, getMobileNavbarLinks, getFilteredActionButtons } from '../config/navbarConfig'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { getFavoritesCount } = useFavorites()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  // Close user menu when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.navbar-user-menu-container')) {
      setIsUserMenuOpen(false)
    }
    if (!e.target.closest('.navbar-notification-container')) {
      setIsNotificationMenuOpen(false)
    }
  }

  useEffect(() => {
    if (isUserMenuOpen || isNotificationMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen, isNotificationMenuOpen])

  // Load notifications from localStorage
  useEffect(() => {
    if (!isAuthenticated) return

    const loadNotifications = () => {
      const stored = JSON.parse(localStorage.getItem(`notifications_${user?.id}`) || '[]')
      setNotifications(stored)
      setUnreadCount(stored.filter(n => !n.read).length)
    }

    loadNotifications()

    // Listen for new projects
    const handleProjectsUpdate = (e) => {
      const projects = e.detail || JSON.parse(localStorage.getItem('projects') || '[]')
      const lastSeenProjectId = parseInt(localStorage.getItem(`lastSeenProjectId_${user?.id}`) || '0')
      
      const newProjects = projects.filter(p => p.id > lastSeenProjectId)
      if (newProjects.length > 0) {
        const newNotifications = newProjects.map(project => ({
          id: `project_${project.id}`,
          type: 'project',
          title: 'Nouveau projet',
          message: project.title,
          link: `/projects`,
          createdAt: project.createdAt || new Date().toISOString(),
          read: false
        }))
        
        const existing = JSON.parse(localStorage.getItem(`notifications_${user?.id}`) || '[]')
        const updated = [...newNotifications, ...existing.filter(n => !newNotifications.find(nn => nn.id === n.id))]
        localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated))
        loadNotifications()
        
        // Update last seen
        const maxId = Math.max(...projects.map(p => p.id))
        localStorage.setItem(`lastSeenProjectId_${user?.id}`, maxId.toString())
      }
    }

    // Listen for new challenges
    const handleChallengesUpdate = (e) => {
      const challenges = e.detail || JSON.parse(localStorage.getItem('challenges') || '[]')
      const lastSeenChallengeId = parseInt(localStorage.getItem(`lastSeenChallengeId_${user?.id}`) || '0')
      
      const newChallenges = challenges.filter(c => c.id > lastSeenChallengeId)
      if (newChallenges.length > 0) {
        const newNotifications = newChallenges.map(challenge => ({
          id: `challenge_${challenge.id}`,
          type: 'challenge',
          title: 'Nouveau défi',
          message: challenge.title,
          link: `/challenges`,
          createdAt: challenge.createdAt || new Date().toISOString(),
          read: false
        }))
        
        const existing = JSON.parse(localStorage.getItem(`notifications_${user?.id}`) || '[]')
        const updated = [...newNotifications, ...existing.filter(n => !newNotifications.find(nn => nn.id === n.id))]
        localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated))
        loadNotifications()
        
        // Update last seen
        const maxId = Math.max(...challenges.map(c => c.id))
        localStorage.setItem(`lastSeenChallengeId_${user?.id}`, maxId.toString())
      }
    }

    // Initialize last seen IDs
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    
    if (projects.length > 0 && !localStorage.getItem(`lastSeenProjectId_${user?.id}`)) {
      const maxId = Math.max(...projects.map(p => p.id))
      localStorage.setItem(`lastSeenProjectId_${user?.id}`, maxId.toString())
    }
    
    if (challenges.length > 0 && !localStorage.getItem(`lastSeenChallengeId_${user?.id}`)) {
      const maxId = Math.max(...challenges.map(c => c.id))
      localStorage.setItem(`lastSeenChallengeId_${user?.id}`, maxId.toString())
    }

    window.addEventListener('projectsUpdated', handleProjectsUpdate)
    window.addEventListener('challengesUpdated', handleChallengesUpdate)

    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate)
      window.removeEventListener('challengesUpdated', handleChallengesUpdate)
    }
  }, [isAuthenticated, user?.id])

  const handleNotificationClick = (notification) => {
    // Mark as read
    const updated = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated))
    setUnreadCount(updated.filter(n => !n.read).length)
    
    // Navigate to link
    if (notification.link) {
      navigate(notification.link)
      setIsNotificationMenuOpen(false)
    }
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated))
    setUnreadCount(0)
  }

  const clearAllNotifications = () => {
    setNotifications([])
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify([]))
    setUnreadCount(0)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-container">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-text-container">
            <span className="brand-text">Data Analysts</span>
            <span className="brand-subtext">GUINÉE</span>
          </div>
        </Link>

        <div className="navbar-nav-container">
          {getFilteredNavbarLinks(isAuthenticated).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Boutons d'action configurables (ajoutés automatiquement depuis navbarConfig) */}
          {getFilteredActionButtons(isAuthenticated).map((button, index) => {
            if (button.type === 'link') {
              return (
                <Link
                  key={`action-${index}`}
                  to={button.path}
                  className={button.className || 'navbar-action-btn'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {button.label}
                  {button.icon && <span className="btn-icon">{button.icon}</span>}
                  {button.badge && <span className="btn-badge">{button.badge}</span>}
                </Link>
              )
            } else if (button.type === 'button') {
              return (
                <button
                  key={`action-${index}`}
                  className={button.className || 'navbar-action-btn'}
                  onClick={button.onClick}
                >
                  {button.label}
                  {button.icon && <span className="btn-icon">{button.icon}</span>}
                  {button.badge && <span className="btn-badge">{button.badge}</span>}
                </button>
              )
            } else if (button.type === 'custom' && button.component) {
              const CustomComponent = button.component
              return <CustomComponent key={`action-${index}`} />
            }
            return null
          })}

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="navbar-notification-container">
                <button
                  className="notification-button"
                  onClick={() => {
                    setIsNotificationMenuOpen(!isNotificationMenuOpen)
                    setIsUserMenuOpen(false)
                  }}
                  aria-label="Notifications"
                  aria-expanded={isNotificationMenuOpen}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>

                {isNotificationMenuOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      <div className="notification-actions">
                        {unreadCount > 0 && (
                          <button className="notification-action-btn" onClick={markAllAsRead} title="Tout marquer comme lu">
                            Tout lire
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button className="notification-action-btn" onClick={clearAllNotifications} title="Effacer tout">
                            Effacer
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>Aucune notification</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(notification => (
                          <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="notification-icon">
                              {notification.type === 'project' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">{notification.title}</div>
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-time">
                                {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            {!notification.read && <div className="notification-dot"></div>}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 10 && (
                      <div className="notification-footer">
                        <Link to="/notifications" onClick={() => setIsNotificationMenuOpen(false)}>
                          Voir toutes les notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="navbar-user-menu-container">
              <button
                className="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menu utilisateur"
                aria-expanded={isUserMenuOpen}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                ) : (
                  <div className="user-avatar-icon">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <svg className="user-menu-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="user-menu-info">
                      <div className="user-menu-name">{user?.name || 'Utilisateur'}</div>
                      <div className="user-menu-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <Link
                    to={`/profiles/${user?.id}`}
                    className="user-menu-item"
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      setIsMenuOpen(false)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Mon profil</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="user-menu-item"
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      setIsMenuOpen(false)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                  {isAuthenticated && user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="user-menu-item"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsMenuOpen(false)
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Administration</span>
                    </Link>
                  )}
                  <div className="user-menu-divider"></div>
                  <button
                    className="user-menu-item user-menu-item-danger"
                    onClick={handleLogout}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
            </>
          ) : null}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
          <span className={isMenuOpen ? 'open' : ''}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        {getMobileNavbarLinks(isAuthenticated).map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Administration
              </Link>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar

