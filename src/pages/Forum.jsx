import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './Forum.css'

const Forum = () => {
  const { isAuthenticated, user, isAdmin } = useAuth()
  const [topics, setTopics] = useState([])
  const [filteredTopics, setFilteredTopics] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const categories = [
    { value: 'all', label: 'Tous', icon: '📋' },
    { value: 'Général', label: 'Général', icon: '💬' },
    { value: 'Technique', label: 'Technique', icon: '💻' },
    { value: 'Projets', label: 'Projets', icon: '🚀' },
    { value: 'Ressources', label: 'Ressources', icon: '📚' },
    { value: 'Carrière', label: 'Carrière', icon: '💼' },
    { value: 'Questions', label: 'Questions', icon: '❓' }
  ]

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('topics') || '[]')
    if (stored.length === 0) {
      const sampleTopics = [
        {
          id: 1,
          title: 'Comment améliorer ses compétences en analyse de données ?',
          content: 'Je cherche des conseils pour progresser en analyse de données. Quels outils recommandez-vous ?',
          author: { id: 1, name: 'Mamadou Diallo', avatar: null },
          category: 'Technique',
          replies: 12,
          views: 234,
          likes: 8,
          isSolved: false,
          tags: ['python', 'analyse', 'débutant'],
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Meilleurs datasets pour pratiquer l\'analyse de données en Guinée',
          content: 'Quels sont les meilleurs datasets disponibles pour pratiquer l\'analyse de données spécifiques à la Guinée ?',
          author: { id: 2, name: 'Fatou Camara', avatar: null },
          category: 'Ressources',
          replies: 8,
          views: 156,
          likes: 15,
          isSolved: true,
          tags: ['dataset', 'guinée', 'pratique'],
          lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'Opportunités de carrière en Data Science en Guinée',
          content: 'Quelles sont les opportunités de carrière pour les data analysts en Guinée ? Partagez vos expériences.',
          author: { id: 3, name: 'Ibrahima Bah', avatar: null },
          category: 'Carrière',
          replies: 20,
          views: 345,
          likes: 22,
          isSolved: false,
          tags: ['carrière', 'emploi', 'guinée'],
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setTopics(sampleTopics)
      setFilteredTopics(sampleTopics)
      localStorage.setItem('topics', JSON.stringify(sampleTopics))
    } else {
      setTopics(stored)
      setFilteredTopics(stored)
    }
  }, [])

  useEffect(() => {
    let filtered = [...topics]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(lowerSearch) ||
        topic.content.toLowerCase().includes(lowerSearch) ||
        (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          const dateA = new Date(a.lastActivity || a.createdAt).getTime()
          const dateB = new Date(b.lastActivity || b.createdAt).getTime()
          return dateB - dateA
        case 'popular':
          const popularityA = (a.replies || 0) + (a.views || 0) + (a.likes || 0) * 2
          const popularityB = (b.replies || 0) + (b.views || 0) + (b.likes || 0) * 2
          return popularityB - popularityA
        case 'most-replies':
          return (b.replies || 0) - (a.replies || 0)
        case 'most-views':
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

    setFilteredTopics(filtered)
  }, [topics, searchTerm, selectedCategory, sortBy])

  const getTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return 'Il y a quelques secondes'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
    return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="forum-page">
      <PageHeader
        title="Forum Communautaire"
        subtitle="Échangez, posez des questions et partagez vos expériences avec la communauté des data analysts"
        imageUrls={[
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="forum-header">
          <div className="forum-header-content">
            <h2>Discussions de la communauté</h2>
            <p>Posez vos questions, partagez vos connaissances et collaborez avec d'autres data analysts</p>
            {filteredTopics.length > 0 && (
              <div className="forum-results-count">
                {filteredTopics.length} discussion{filteredTopics.length > 1 ? 's' : ''} trouvée{filteredTopics.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          {isAuthenticated && (
            <Link to="/forum/create" className="btn btn-primary btn-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Nouveau sujet
            </Link>
          )}
        </div>

        <div className="forum-filters">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher dans les discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="forum-controls">
            <label className="sort-label">Trier par :</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                // Scroll to top when sorting changes
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <option value="recent">Plus récent</option>
              <option value="popular">Plus populaire</option>
              <option value="most-replies">Plus de réponses</option>
              <option value="most-views">Plus de vues</option>
            </select>
          </div>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Section Invités Spéciaux */}
        {filteredTopics.filter(t => t.isSpecialGuest && (t.specialGuests || t.specialGuest)).length > 0 && (
          <div className="special-guests-section">
            <div className="special-guests-header">
              <div className="special-guests-title">
                <span className="special-guests-icon">⭐</span>
                <h2>Invitations Spéciales</h2>
              </div>
              <p>Rencontrez nos experts et participez à des sessions exclusives</p>
            </div>
            <div className="special-guests-grid">
              {filteredTopics
                .filter(topic => topic.isSpecialGuest && (topic.specialGuests || topic.specialGuest))
                .map((topic) => {
                  // Support pour l'ancien format (specialGuest) et le nouveau (specialGuests)
                  const guests = topic.specialGuests || (topic.specialGuest ? [topic.specialGuest] : [])
                  
                  return (
                    <Link key={topic.id} to={`/forum/${topic.id}`} className="special-guest-card">
                      <div className="special-guest-badge">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                        {guests.length > 1 ? `${guests.length} Invités Spéciaux` : 'Invité Spécial'}
                      </div>
                      <div className="special-guest-content">
                        {guests.length === 1 ? (
                          // Affichage simple pour un seul invité
                          <>
                            <div className="special-guest-avatar-wrapper">
                              {guests[0].avatar ? (
                                <img src={guests[0].avatar} alt={guests[0].name} className="special-guest-avatar" />
                              ) : (
                                <div className="special-guest-avatar">
                                  {guests[0].name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="special-guest-glow"></div>
                            </div>
                            <div className="special-guest-info">
                              <h3 className="special-guest-name">{guests[0].name}</h3>
                              <p className="special-guest-title">{guests[0].title}</p>
                              <div className="special-guest-topic">
                                <span className="special-guest-topic-label">Sujet :</span>
                                <span className="special-guest-topic-title">{topic.title}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Affichage multiple pour plusieurs invités
                          <>
                            <div className="multiple-guests-avatars">
                              {guests.slice(0, 4).map((guest, idx) => (
                                <div key={idx} className="guest-avatar-small" style={{ zIndex: guests.length - idx }}>
                                  {guest.avatar ? (
                                    <img src={guest.avatar} alt={guest.name} />
                                  ) : (
                                    <span>{guest.name.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                              ))}
                              {guests.length > 4 && (
                                <div className="guest-avatar-small guest-avatar-more">
                                  <span>+{guests.length - 4}</span>
                                </div>
                              )}
                            </div>
                            <div className="special-guest-info">
                              <h3 className="special-guest-name">{guests.length} Conférenciers</h3>
                              <div className="guests-list">
                                {guests.slice(0, 3).map((guest, idx) => (
                                  <div key={idx} className="guest-item-preview">
                                    <span className="guest-name-preview">{guest.name}</span>
                                    <span className="guest-title-preview">{guest.title}</span>
                                  </div>
                                ))}
                                {guests.length > 3 && (
                                  <div className="guest-item-preview">
                                    <span className="guest-more">+ {guests.length - 3} autre{guests.length - 3 > 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                              <div className="special-guest-topic">
                                <span className="special-guest-topic-label">Sujet :</span>
                                <span className="special-guest-topic-title">{topic.title}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="special-guest-footer">
                        <span className="special-guest-stats">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {topic.replies || 0} réponses
                        </span>
                        <span className="special-guest-cta">
                          Participer
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        )}

        {filteredTopics.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Aucune discussion trouvée</h3>
            <p>
              {searchTerm || selectedCategory !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Soyez le premier à créer une discussion !'}
            </p>
            {isAuthenticated && (
              <Link to="/forum/create" className="btn btn-primary">
                Créer une discussion
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-primary">
                Se connecter pour créer une discussion
              </Link>
            )}
          </div>
        ) : (
          <div className="topics-grid animate-stagger">
            {filteredTopics
              .filter(topic => !topic.isSpecialGuest || (!topic.specialGuests && !topic.specialGuest))
              .map((topic, index) => (
              <div key={topic.id} className="topic-card-feature card hover-lift" style={{ '--delay': index }}>
                <div className="topic-icon-wrapper">
                  <span className="topic-icon">
                    {categories.find(c => c.value === topic.category)?.icon || '💬'}
                  </span>
                  {topic.isSolved && (
                    <span className="topic-solved-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
                <div className="topic-category-badge">
                  {topic.category}
                </div>
                <h3 className="topic-title-feature">{topic.title}</h3>
                <p className="topic-description-feature">{topic.content}</p>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="topic-tags-feature">
                    {topic.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-feature">{tag}</span>
                    ))}
                    {topic.tags.length > 3 && (
                      <span className="tag-feature">+{topic.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="topic-stats-feature">
                  <span className="stat-feature" title="Réponses">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {topic.replies || 0}
                  </span>
                  <span className="stat-feature" title="Vues">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {topic.views || 0}
                  </span>
                </div>
                <div className="topic-author-feature">
                  <div className="author-avatar-feature">
                    {topic.author.avatar ? (
                      <img src={topic.author.avatar} alt={topic.author.name} />
                    ) : (
                      <span>{topic.author.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="author-info-feature">
                    <div className="author-name-feature">{topic.author.name}</div>
                    <div className="topic-date-feature">{getTimeAgo(topic.createdAt)}</div>
                  </div>
                </div>
                <Link 
                  to={`/forum/${topic.id}`}
                  className="btn-view-details-feature"
                >
                  Voir les détails
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Forum
