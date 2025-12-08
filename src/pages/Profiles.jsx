import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './Profiles.css'

const Profiles = () => {
  const { user: currentUser, isAuthenticated } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [filteredProfiles, setFilteredProfiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterExpertise, setFilterExpertise] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    totalMentors: 0,
    totalAdmins: 0,
    totalActivity: 0,
    expertiseDistribution: {
      'Débutant': 0,
      'Intermédiaire': 0,
      'Avancé': 0,
      'Expert': 0
    }
  })

  const handleBecomeMentor = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour devenir mentor')
      return
    }
    // In real app, this would open a form or navigate to a page
    alert('Pour devenir mentor, vous devez avoir un niveau "Avancé" ou "Expert". Améliorez vos compétences et complétez le questionnaire d\'expertise lors de votre prochaine mise à jour de profil.')
  }

  // Check if current user is already a mentor
  const isMentor = currentUser && (currentUser.expertiseLevel === 'Avancé' || currentUser.expertiseLevel === 'Expert')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('users') || '[]')
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    
    // Enrich profiles with stats
    const enrichedProfiles = stored.map(profile => {
      const userArticles = articles.filter(a => a.author?.id === profile.id).length
      const userTopics = topics.filter(t => t.author?.id === profile.id).length
      const userReplies = topics.reduce((acc, topic) => {
        const replies = topic.replies || []
        return acc + replies.filter(r => r.author?.id === profile.id).length
      }, 0)
      
      return {
        ...profile,
        articles: userArticles,
        topics: userTopics,
        replies: userReplies,
        totalActivity: userArticles + userTopics + userReplies
      }
    })

    if (enrichedProfiles.length === 0) {
      const sampleProfiles = [
        {
          id: 1,
          name: 'Mamadou Diallo',
          email: 'mamadou@example.com',
          bio: 'Data Analyst passionné par l\'analyse de données économiques et la visualisation. Spécialisé en Python et Power BI.',
          avatar: null,
          role: 'user',
          expertiseLevel: 'Intermédiaire',
          articles: 5,
          topics: 12,
          replies: 8,
          totalActivity: 25,
          joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Fatou Camara',
          email: 'fatou@example.com',
          bio: 'Data Scientist avec une expertise en Machine Learning et statistiques. J\'aime partager mes connaissances.',
          avatar: null,
          role: 'user',
          expertiseLevel: 'Avancé',
          articles: 8,
          topics: 6,
          replies: 15,
          totalActivity: 29,
          joinDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          name: 'Ibrahima Bah',
          email: 'ibrahima@example.com',
          bio: 'Expert en Business Intelligence et Tableau. Consultant en analyse de données pour entreprises.',
          avatar: null,
          role: 'user',
          expertiseLevel: 'Expert',
          articles: 12,
          topics: 4,
          replies: 20,
          totalActivity: 36,
          joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setProfiles(sampleProfiles)
      setFilteredProfiles(sampleProfiles)
      localStorage.setItem('users', JSON.stringify(sampleProfiles))
    } else {
      setProfiles(enrichedProfiles)
      setFilteredProfiles(enrichedProfiles)
    }
  }, [])

  useEffect(() => {
    let filtered = [...profiles]

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(lowerSearch) ||
        profile.email.toLowerCase().includes(lowerSearch) ||
        (profile.bio && profile.bio.toLowerCase().includes(lowerSearch))
      )
    }

    // Filter by expertise level
    if (filterExpertise !== 'all') {
      filtered = filtered.filter(profile => profile.expertiseLevel === filterExpertise)
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(profile => profile.role === filterRole)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.joinDate || 0) - new Date(a.joinDate || 0)
        case 'active':
          return b.totalActivity - a.totalActivity
        case 'name':
          return a.name.localeCompare(b.name)
        case 'most-articles':
          return b.articles - a.articles
        default:
          return 0
      }
    })

    setFilteredProfiles(filtered)
  }, [profiles, searchTerm, sortBy, filterExpertise, filterRole])

  const getJoinDate = (date) => {
    if (!date) return 'Membre depuis longtemps'
    const joinDate = new Date(date)
    const now = new Date()
    const diffInDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 30) return `Membre depuis ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    if (diffInDays < 365) return `Membre depuis ${Math.floor(diffInDays / 30)} mois`
    return `Membre depuis ${Math.floor(diffInDays / 365)} an${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`
  }

  const getExpertiseBadge = (level) => {
    const badges = {
      'Débutant': { emoji: '🌱', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      'Intermédiaire': { emoji: '📊', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      'Avancé': { emoji: '🚀', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
      'Expert': { emoji: '⭐', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
    }
    return badges[level] || { emoji: '👤', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' }
  }

  return (
    <div className="profiles-page">
      <PageHeader
        title="Membres de la Communauté"
        subtitle="Découvrez et connectez-vous avec les data analysts de Guinée"
        imageUrls={[
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="profiles-header">
          <div className="profiles-header-content">
            <h2>Explorer les membres</h2>
            <p>Rencontrez des data analysts passionnés, partagez vos expériences et collaborez sur des projets</p>
          </div>
          {isAuthenticated && !isMentor && (
            <button onClick={handleBecomeMentor} className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Devenir mentor
            </button>
          )}
        </div>

        <div className="profiles-filters">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un membre par nom, email ou bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="profiles-controls">
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Afficher les filtres"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filtres
              {(filterExpertise !== 'all' || filterRole !== 'all') && (
                <span className="filter-badge">{[filterExpertise !== 'all' && filterExpertise, filterRole !== 'all' && filterRole].filter(Boolean).length}</span>
              )}
            </button>
            
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Plus récent</option>
              <option value="active">Plus actif</option>
              <option value="name">Nom (A-Z)</option>
              <option value="most-articles">Plus d'articles</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Niveau d'expertise</label>
              <select
                className="filter-select"
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
              >
                <option value="all">Tous les niveaux</option>
                <option value="Débutant">🌱 Débutant</option>
                <option value="Intermédiaire">📊 Intermédiaire</option>
                <option value="Avancé">🚀 Avancé</option>
                <option value="Expert">⭐ Expert</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Rôle</label>
              <select
                className="filter-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="user">👤 Utilisateur</option>
                <option value="admin">👑 Administrateur</option>
              </select>
            </div>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setFilterExpertise('all')
                setFilterRole('all')
              }}
            >
              Réinitialiser
            </button>
          </div>
        )}

        {filteredProfiles.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Aucun membre trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <>
            <div className="profiles-stats-bar">
              <span>{filteredProfiles.length} membre{filteredProfiles.length > 1 ? 's' : ''} trouvé{filteredProfiles.length > 1 ? 's' : ''}</span>
            </div>
            <div className="profiles-grid">
              {filteredProfiles.map((profile) => (
                <Link 
                  key={profile.id} 
                  to={`/profiles/${profile.id}`} 
                  className="profile-card"
                >
                  <div className="profile-card-header">
                    <div className="profile-avatar-wrapper">
                      <div className="profile-avatar">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} />
                        ) : (
                          <span>{profile.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {profile.expertiseLevel && (
                        <div 
                          className="expertise-badge"
                          style={{
                            backgroundColor: getExpertiseBadge(profile.expertiseLevel).bg,
                            color: getExpertiseBadge(profile.expertiseLevel).color,
                            borderColor: getExpertiseBadge(profile.expertiseLevel).color
                          }}
                        >
                          {getExpertiseBadge(profile.expertiseLevel).emoji} {profile.expertiseLevel}
                        </div>
                      )}
                    </div>
                    <div className="profile-badges">
                      {profile.role === 'admin' && (
                        <span className="admin-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                          Admin
                        </span>
                      )}
                      {(profile.expertiseLevel === 'Avancé' || profile.expertiseLevel === 'Expert') && (
                        <span className="mentor-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Mentor
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="profile-card-body">
                    <h3>{profile.name}</h3>
                    <p className="profile-email">{profile.email}</p>
                    <p className="profile-bio">
                      {profile.bio || 'Membre de la communauté des Data Analysts de Guinée'}
                    </p>
                    <div className="profile-stats">
                      <div className="stat-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <div className="stat-value">{profile.articles || 0}</div>
                          <div className="stat-label">Ressources</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <div className="stat-value">{profile.topics || 0}</div>
                          <div className="stat-label">Sujets</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <div>
                          <div className="stat-value">{profile.replies || 0}</div>
                          <div className="stat-label">Réponses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-card-footer">
                    <span className="join-date">{getJoinDate(profile.joinDate)}</span>
                    {profile.totalActivity > 0 && (
                      <span className="activity-badge">
                        {profile.totalActivity} activité{profile.totalActivity > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Profiles

