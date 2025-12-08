import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './Notifications.css'

const Notifications = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // all, unread, read
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    loadNotifications()
  }, [user, isAuthenticated, navigate])

  const loadNotifications = () => {
    if (!user?.id) return
    
    const stored = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]')
    // Sort by date (newest first)
    const sorted = stored.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setNotifications(sorted)
    setLoading(false)
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    const updated = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))

    // Navigate to link if available
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
  }

  const clearAllNotifications = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      setNotifications([])
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]))
    }
  }

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    setNotifications(updated)
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return 'Il y a quelques secondes'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
    return past.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="notifications-page">
        <PageHeader
          title="Notifications"
          subtitle="Consultez toutes vos notifications"
          imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80"
        />
        <div className="container">
          <div className="notifications-loading">
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle="Consultez toutes vos notifications"
        imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80"
      />
      <div className="container">
        <div className="notifications-header">
          <div className="notifications-header-content">
            <h2>Mes notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
                Tout marquer comme lu
              </button>
            )}
            {notifications.length > 0 && (
              <button className="btn btn-outline btn-sm btn-danger" onClick={clearAllNotifications}>
                Tout effacer
              </button>
            )}
          </div>
        </div>

        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Lues ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>
                {filter === 'unread' 
                  ? 'Aucune notification non lue' 
                  : filter === 'read'
                  ? 'Aucune notification lue'
                  : 'Aucune notification'}
              </h3>
              <p>
                {filter === 'all' 
                  ? 'Vous n\'avez pas encore de notifications. Elles apparaîtront ici lorsqu\'il y aura de nouvelles activités.'
                  : 'Aucune notification correspond à ce filtre.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-card-icon">
                  {notification.type === 'project' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : notification.type === 'challenge' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="notification-card-content">
                  <div className="notification-card-header">
                    <h3 className="notification-card-title">{notification.title}</h3>
                    {!notification.read && <div className="notification-card-dot"></div>}
                  </div>
                  <p className="notification-card-message">{notification.message}</p>
                  <div className="notification-card-footer">
                    <span className="notification-card-time">{getTimeAgo(notification.createdAt)}</span>
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      title="Supprimer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications

