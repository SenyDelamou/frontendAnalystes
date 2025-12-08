import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import BadgesDisplay from '../components/BadgesDisplay'
import './Dashboard.css'

const Dashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    resources: 0,
    projects: 0,
    challenges: 0,
    topics: 0
  })
  const [animatedStats, setAnimatedStats] = useState({
    resources: 0,
    projects: 0,
    challenges: 0,
    topics: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Load user stats
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    
    const newStats = {
      resources: articles.filter(a => a.author?.id === user?.id).length,
      projects: projects.filter(p => p.owner?.id === user?.id).length,
      challenges: challenges.filter(c => c.organizer?.id === user?.id).length,
      topics: topics.filter(t => t.author?.id === user?.id).length
    }
    setStats(newStats)

    // Animate numbers counting up
    const duration = 1500
    const steps = 60
    const stepDuration = duration / steps
    
    Object.keys(newStats).forEach((key) => {
      const target = newStats[key]
      const increment = target / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }))
      }, stepDuration)
    })
  }, [user, isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Gérez vos ressources, projets, défis et activités sur la plateforme"
        imageUrls={[
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="welcome-text">
              <h2>Bienvenue, <span className="welcome-name">{user?.name || 'Utilisateur'}</span> !</h2>
              <p>Gérez vos activités et suivez votre progression sur la plateforme</p>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card card animate-stat" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">📚</div>
            <div className="stat-value">{animatedStats.resources}</div>
            <div className="stat-label">Ressources</div>
          </div>
          <div className="stat-card card animate-stat" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">💼</div>
            <div className="stat-value">{animatedStats.projects}</div>
            <div className="stat-label">Projets</div>
          </div>
          <div className="stat-card card animate-stat" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{animatedStats.challenges}</div>
            <div className="stat-label">Défis</div>
          </div>
          <div className="stat-card card animate-stat" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">💬</div>
            <div className="stat-value">{animatedStats.topics}</div>
            <div className="stat-label">Sujets</div>
          </div>
        </div>

        <div className="dashboard-badges-section">
          <BadgesDisplay />
        </div>

        <div className="dashboard-actions">
          <Link to="/articles/create" className="action-card card animate-action" style={{ animationDelay: '0.1s' }}>
            <div className="action-icon">📚</div>
            <h3>Partager une ressource</h3>
            <p>Partagez datasets, tutoriels ou outils</p>
          </Link>
          {isAdmin && (
            <>
              <Link to="/projects/create" className="action-card card animate-action" style={{ animationDelay: '0.2s' }}>
                <div className="action-icon">💼</div>
                <h3>Créer un projet</h3>
                <p>Lancez un projet collaboratif</p>
              </Link>
              <Link to="/challenges/create" className="action-card card animate-action" style={{ animationDelay: '0.3s' }}>
                <div className="action-icon">🏆</div>
                <h3>Lancer un défi</h3>
                <p>Créez un défi pour la communauté</p>
              </Link>
            </>
          )}
          <Link to="/coaching" className="action-card card animate-action" style={{ animationDelay: '0.4s' }}>
            <div className="action-icon">🎓</div>
            <h3>Devenir mentor</h3>
            <p>Partagez vos connaissances</p>
          </Link>
          {isAdmin && (
            <Link to="/forum/create" className="action-card card animate-action" style={{ animationDelay: '0.5s' }}>
              <div className="action-icon">💬</div>
              <h3>Créer un sujet</h3>
              <p>Lancez une discussion</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

