import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './Favorites.css'

const Favorites = () => {
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('resources')
  const [favoriteResources, setFavoriteResources] = useState([])
  const [favoriteProjects, setFavoriteProjects] = useState([])
  const [favoriteChallenges, setFavoriteChallenges] = useState([])

  useEffect(() => {
    if (!isAuthenticated) return

    // Load favorite resources
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const resources = articles.filter(a => favorites.resources.includes(a.id))
    setFavoriteResources(resources)

    // Load favorite projects
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const favProjects = projects.filter(p => favorites.projects.includes(p.id))
    setFavoriteProjects(favProjects)

    // Load favorite challenges
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    const favChallenges = challenges.filter(c => favorites.challenges.includes(c.id))
    setFavoriteChallenges(favChallenges)
  }, [favorites, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="favorites-auth-required">
            <h2>Connexion requise</h2>
            <p>Vous devez être connecté pour accéder à vos favoris.</p>
            <Link to="/login" className="btn btn-primary">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalFavorites = favoriteResources.length + favoriteProjects.length + favoriteChallenges.length

  return (
    <div className="favorites-page">
      <PageHeader
        title="Mes Favoris"
        subtitle={`${totalFavorites} élément${totalFavorites > 1 ? 's' : ''} sauvegardé${totalFavorites > 1 ? 's' : ''}`}
        imageUrl="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80"
      />
      <div className="container">
        <div className="favorites-content">
          {/* Tabs */}
          <div className="favorites-tabs">
            <button
              className={`favorites-tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              📚 Ressources ({favoriteResources.length})
            </button>
            <button
              className={`favorites-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              💼 Projets ({favoriteProjects.length})
            </button>
            <button
              className={`favorites-tab ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              🏆 Défis ({favoriteChallenges.length})
            </button>
          </div>

          {/* Content */}
          <div className="favorites-tab-content">
            {activeTab === 'resources' && (
              <div className="favorites-grid">
                {favoriteResources.length === 0 ? (
                  <div className="favorites-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucune ressource favorite</p>
                    <Link to="/articles" className="btn btn-primary">
                      Explorer les ressources
                    </Link>
                  </div>
                ) : (
                  favoriteResources.map(resource => (
                    <div key={resource.id} className="favorite-card">
                      <Link to={`/articles/${resource.id}`} className="favorite-card-link">
                        <div className="favorite-card-header">
                          <span className="favorite-category">{resource.category}</span>
                          <button
                            className="favorite-remove-btn"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite('resources', resource.id)
                            }}
                            title="Retirer des favoris"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        <h3>{resource.title}</h3>
                        <p>{resource.excerpt || resource.content?.substring(0, 120)}...</p>
                        <div className="favorite-card-footer">
                          <span>👁️ {resource.views || 0}</span>
                          <span>❤️ {resource.likes || 0}</span>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="favorites-grid">
                {favoriteProjects.length === 0 ? (
                  <div className="favorites-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun projet favori</p>
                    <Link to="/projects" className="btn btn-primary">
                      Explorer les projets
                    </Link>
                  </div>
                ) : (
                  favoriteProjects.map(project => (
                    <div key={project.id} className="favorite-card">
                      <Link to="/projects" className="favorite-card-link">
                        <div className="favorite-card-header">
                          <span className={`favorite-status status-${project.status}`}>
                            {project.status === 'recruiting' && '🔍 Recrutement'}
                            {project.status === 'active' && '🚀 En cours'}
                            {project.status === 'completed' && '✅ Terminé'}
                          </span>
                          <button
                            className="favorite-remove-btn"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite('projects', project.id)
                            }}
                            title="Retirer des favoris"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        <h3>{project.title}</h3>
                        <p>{project.description?.substring(0, 120)}...</p>
                        <div className="favorite-card-footer">
                          <span>👥 {project.members || 0}/{project.maxMembers || 0}</span>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="favorites-grid">
                {favoriteChallenges.length === 0 ? (
                  <div className="favorites-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun défi favori</p>
                    <Link to="/challenges" className="btn btn-primary">
                      Explorer les défis
                    </Link>
                  </div>
                ) : (
                  favoriteChallenges.map(challenge => (
                    <div key={challenge.id} className="favorite-card">
                      <Link to="/challenges" className="favorite-card-link">
                        <div className="favorite-card-header">
                          <span className={`favorite-status status-${challenge.status}`}>
                            {challenge.status === 'active' && '🚀 Actif'}
                            {challenge.status === 'upcoming' && '📅 À venir'}
                            {challenge.status === 'completed' && '✅ Terminé'}
                          </span>
                          <button
                            className="favorite-remove-btn"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite('challenges', challenge.id)
                            }}
                            title="Retirer des favoris"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        <h3>{challenge.title}</h3>
                        <p>{challenge.description?.substring(0, 120)}...</p>
                        <div className="favorite-card-footer">
                          <span>👥 {challenge.participants || 0}</span>
                          {challenge.prize && <span>💰 {challenge.prize}</span>}
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Favorites

