import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './ProfileDetail.css'

const ProfileDetail = () => {
  const { id } = useParams()
  const { user: currentUser, updateUser, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    email: '',
    avatar: '',
    backgroundImage: ''
  })
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showBackgroundModal, setShowBackgroundModal] = useState(false)
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [stats, setStats] = useState({
    resources: 0,
    projects: 0,
    challenges: 0,
    topics: 0
  })
  const [userResources, setUserResources] = useState([])
  const [userProjects, setUserProjects] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [activeTab, setActiveTab] = useState('resources')

  const isOwnProfile = isAuthenticated && (currentUser?.id === parseInt(id) || currentUser?.id?.toString() === id?.toString())

  useEffect(() => {
    // Load user profile
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Try to find user by ID (support both numeric and string IDs)
    let foundUser = users.find(u => {
      const userId = u.id?.toString()
      const searchId = id?.toString()
      return userId === searchId || parseInt(userId) === parseInt(searchId)
    })
    
    // If not found, try to create a demo profile from projects/challenges participants
    if (!foundUser) {
      // Check in projects members
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      for (const project of projects) {
        const member = project.membersList?.find(m => 
          m.userId?.toString() === id?.toString() || 
          parseInt(m.userId) === parseInt(id)
        )
        if (member) {
          foundUser = {
            id: member.userId,
            name: member.name,
            avatar: member.avatar,
            bio: `Membre du projet "${project.title}"`,
            email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            role: member.role === 'Owner' ? 'user' : 'user',
            joinedAt: member.joinedAt,
            expertiseLevel: 'Intermédiaire'
          }
          // Sauvegarder le profil de démo dans localStorage
          const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
          if (!allUsers.find(u => u.id?.toString() === foundUser.id?.toString())) {
            allUsers.push(foundUser)
            localStorage.setItem('users', JSON.stringify(allUsers))
          }
          break
        }
      }
      
      // Check in challenges participants
      if (!foundUser) {
        const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
        for (const challenge of challenges) {
          const participant = challenge.participantsList?.find(p => 
            p.userId?.toString() === id?.toString() || 
            parseInt(p.userId) === parseInt(id)
          )
          if (participant) {
            foundUser = {
              id: participant.userId,
              name: participant.name,
              avatar: participant.avatar,
              bio: `Participant au défi "${challenge.title}"`,
              email: `${participant.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
              role: 'user',
              joinedAt: participant.joinedAt,
              expertiseLevel: 'Intermédiaire'
            }
            // Sauvegarder le profil de démo dans localStorage
            const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
            if (!allUsers.find(u => u.id?.toString() === foundUser.id?.toString())) {
              allUsers.push(foundUser)
              localStorage.setItem('users', JSON.stringify(allUsers))
            }
            break
          }
        }
      }
    }
    
    if (foundUser) {
      setProfile(foundUser)
      setEditForm({
        name: foundUser.name || '',
        bio: foundUser.bio || '',
        email: foundUser.email || '',
        avatar: foundUser.avatar || '',
        backgroundImage: foundUser.backgroundImage || ''
      })
      setAvatarUrl(foundUser.avatar || '')
      setBackgroundUrl(foundUser.backgroundImage || '')
    } else {
      // If not found, use current user if it's their profile
      if (isOwnProfile && currentUser) {
        setProfile(currentUser)
        setEditForm({
          name: currentUser.name || '',
          bio: currentUser.bio || '',
          email: currentUser.email || '',
          avatar: currentUser.avatar || '',
          backgroundImage: currentUser.backgroundImage || ''
        })
        setAvatarUrl(currentUser.avatar || '')
        setBackgroundUrl(currentUser.backgroundImage || '')
      }
    }

    // Load user's resources
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const userArticles = articles.filter(a => {
      const authorId = a.author?.id?.toString()
      const searchId = id?.toString()
      return authorId === searchId || parseInt(authorId) === parseInt(searchId)
    })
    setUserResources(userArticles)
    setStats(prev => ({ ...prev, resources: userArticles.length }))

    // Load user's projects (as owner)
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const userProjectsList = projects.filter(p => {
      const ownerId = p.owner?.id?.toString()
      const searchId = id?.toString()
      return ownerId === searchId || parseInt(ownerId) === parseInt(searchId)
    })
    setUserProjects(userProjectsList)
    setStats(prev => ({ ...prev, projects: userProjectsList.length }))

    // Load user's challenges
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    const userChallengesList = challenges.filter(c => {
      const organizerId = c.organizer?.id?.toString()
      const searchId = id?.toString()
      return organizerId === searchId || parseInt(organizerId) === parseInt(searchId)
    })
    setUserChallenges(userChallengesList)
    setStats(prev => ({ ...prev, challenges: userChallengesList.length }))

    // Load user's topics
    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const userTopics = topics.filter(t => {
      const authorId = t.author?.id?.toString()
      const searchId = id?.toString()
      return authorId === searchId || parseInt(authorId) === parseInt(searchId)
    })
    setStats(prev => ({ ...prev, topics: userTopics.length }))
  }, [id, currentUser, isOwnProfile])

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result
        setAvatarUrl(imageUrl)
        setEditForm({ ...editForm, avatar: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUrlChange = (e) => {
    setAvatarUrl(e.target.value)
    setEditForm({ ...editForm, avatar: e.target.value })
  }

  const handleSaveAvatar = () => {
    if (!isOwnProfile) return

    const updatedProfile = {
      ...profile,
      avatar: avatarUrl
    }

    // Update in users list
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedUsers = users.map(u => 
      u.id === updatedProfile.id ? updatedProfile : u
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // Update current user if it's their profile
    if (currentUser?.id === updatedProfile.id) {
      updateUser(updatedProfile)
    }

    setProfile(updatedProfile)
    setShowAvatarModal(false)
  }

  const handleBackgroundUrlChange = (e) => {
    setBackgroundUrl(e.target.value)
    setEditForm({ ...editForm, backgroundImage: e.target.value })
  }

  const handleSaveBackground = () => {
    if (!isOwnProfile) return

    const updatedProfile = {
      ...profile,
      backgroundImage: backgroundUrl
    }

    // Update in users list
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedUsers = users.map(u => 
      u.id === updatedProfile.id ? updatedProfile : u
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // Update current user if it's their profile
    if (currentUser?.id === updatedProfile.id) {
      updateUser(updatedProfile)
    }

    setProfile(updatedProfile)
    setShowBackgroundModal(false)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!isOwnProfile) return

    const updatedProfile = {
      ...profile,
      ...editForm
    }

    // Update in users list
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedUsers = users.map(u => 
      u.id === updatedProfile.id ? updatedProfile : u
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // Update current user if it's their profile
    if (currentUser?.id === updatedProfile.id) {
      updateUser(updatedProfile)
    }

    setProfile(updatedProfile)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      email: profile?.email || ''
    })
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <div className="profile-detail-page">
        <div className="container">
          <div className="profile-not-found">
            <h2>Profil non trouvé</h2>
            <p>L'utilisateur que vous recherchez n'existe pas.</p>
            <Link to="/profiles" className="btn btn-primary">
              Retour aux profils
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get user's background image or use default
  const backgroundImage = profile.backgroundImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"

  return (
    <div className="profile-detail-page">
      <PageHeader
        title={profile.name || 'Profil'}
        subtitle={profile.bio || 'Membre de la communauté des Data Analysts de Guinée'}
        imageUrl={backgroundImage}
      />
      <div className="container">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="profile-header-content">
              <div className="profile-avatar-container">
                <div className="profile-avatar-large">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} />
                  ) : (
                    <span>{profile.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  {profile.role === 'admin' && (
                    <div className="admin-badge">👑 Admin</div>
                  )}
                </div>
                {isOwnProfile && !isEditing && (
                  <button
                    className="btn-change-avatar"
                    onClick={() => setShowAvatarModal(true)}
                    title="Changer la photo de profil"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Changer la photo
                  </button>
                )}
              </div>
              <div className="profile-info">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="profile-edit-form">
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        name="bio"
                        value={editForm.bio}
                        onChange={handleEditChange}
                        rows="4"
                        placeholder="Parlez-nous de vous..."
                        maxLength={300}
                      />
                      <small className="char-count">{editForm.bio.length}/300</small>
                    </div>
                    <div className="profile-edit-actions">
                      <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                        Annuler
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-name-section">
                      <h1>{profile.name || 'Utilisateur'}</h1>
                      {isOwnProfile && (
                        <button
                          className="btn-edit-profile"
                          onClick={() => setIsEditing(true)}
                          title="Modifier le profil"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Modifier
                        </button>
                      )}
                    </div>
                    <p className="profile-email">{profile.email}</p>
                    {profile.bio && (
                      <p className="profile-bio-text">{profile.bio}</p>
                    )}
                    <div className="profile-meta">
                      <span className="profile-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Membre depuis {new Date(profile.joinedAt || Date.now()).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-value">{stats.resources}</div>
                <div className="stat-label">Ressources</div>
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <div className="stat-value">{stats.projects}</div>
                <div className="stat-label">Projets</div>
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{stats.challenges}</div>
                <div className="stat-label">Défis</div>
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <div className="stat-value">{stats.topics}</div>
                <div className="stat-label">Sujets</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <div className="profile-actions-card">
              <h3>Actions</h3>
              <div className="profile-actions-grid">
                <button
                  className="profile-action-btn"
                  onClick={() => setShowBackgroundModal(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Changer l'image de fond</span>
                </button>
                <Link to="/change-password" className="profile-action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Changer le mot de passe</span>
                </Link>
                <Link to="/dashboard" className="profile-action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Mon Dashboard</span>
                </Link>
                {currentUser?.role === 'admin' && (
                  <Link to="/admin" className="profile-action-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Administration</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              📚 Ressources ({stats.resources})
            </button>
            <button
              className={`profile-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              💼 Projets ({stats.projects})
            </button>
            <button
              className={`profile-tab ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              🏆 Défis ({stats.challenges})
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {activeTab === 'resources' && (
              <div className="profile-items-grid">
                {userResources.length === 0 ? (
                  <div className="profile-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucune ressource partagée</p>
                    {isOwnProfile && (
                      <Link to="/articles" className="btn btn-primary">
                        Partager une ressource
                      </Link>
                    )}
                  </div>
                ) : (
                  userResources.map(resource => (
                    <Link key={resource.id} to={`/articles/${resource.id}`} className="profile-item-card">
                      <div className="profile-item-header">
                        <span className="profile-item-category">{resource.category || 'Ressource'}</span>
                        <span className="profile-item-date">
                          {new Date(resource.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <h4>{resource.title}</h4>
                      <p>{resource.excerpt || resource.content?.substring(0, 100)}...</p>
                      <div className="profile-item-footer">
                        <span>👁️ {resource.views || 0} vues</span>
                        <span>❤️ {resource.likes || 0} likes</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="profile-items-grid">
                {userProjects.length === 0 ? (
                  <div className="profile-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun projet créé</p>
                    {isOwnProfile && isAdmin && (
                      <Link to="/projects/create" className="btn btn-primary">
                        Créer un projet
                      </Link>
                    )}
                  </div>
                ) : (
                  userProjects.map(project => (
                    <Link key={project.id} to="/projects" className="profile-item-card">
                      <div className="profile-item-header">
                        <span className={`profile-item-status status-${project.status}`}>
                          {project.status === 'recruiting' && '🔍 Recrutement'}
                          {project.status === 'active' && '🚀 En cours'}
                          {project.status === 'completed' && '✅ Terminé'}
                        </span>
                        <span className="profile-item-date">
                          {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <h4>{project.title}</h4>
                      <p>{project.description?.substring(0, 100)}...</p>
                      <div className="profile-item-footer">
                        <span>👥 {project.members || 0}/{project.maxMembers || 0} membres</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="profile-items-grid">
                {userChallenges.length === 0 ? (
                  <div className="profile-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun défi créé</p>
                    {isOwnProfile && isAdmin && (
                      <Link to="/challenges/create" className="btn btn-primary">
                        Lancer un défi
                      </Link>
                    )}
                  </div>
                ) : (
                  userChallenges.map(challenge => (
                    <Link key={challenge.id} to="/challenges" className="profile-item-card">
                      <div className="profile-item-header">
                        <span className={`profile-item-status status-${challenge.status}`}>
                          {challenge.status === 'active' && '🚀 Actif'}
                          {challenge.status === 'upcoming' && '📅 À venir'}
                          {challenge.status === 'completed' && '✅ Terminé'}
                        </span>
                        <span className="profile-item-date">
                          {new Date(challenge.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <h4>{challenge.title}</h4>
                      <p>{challenge.description?.substring(0, 100)}...</p>
                      <div className="profile-item-footer">
                        <span>👥 {challenge.participants || 0} participants</span>
                        {challenge.prize && <span>💰 {challenge.prize}</span>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>Changer la photo de profil</h3>
              <button className="avatar-modal-close" onClick={() => setShowAvatarModal(false)}>×</button>
            </div>
            <div className="avatar-modal-content">
              <div className="avatar-preview">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" />
                ) : (
                  <div className="avatar-preview-placeholder">
                    <span>{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                )}
              </div>
              <div className="avatar-options">
                <div className="form-group">
                  <label>URL de l'image</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={handleAvatarUrlChange}
                    placeholder="https://example.com/photo.jpg"
                    className="avatar-url-input"
                  />
                  <small className="form-hint">Collez l'URL de votre photo de profil</small>
                </div>
                <div className="auth-divider">
                  <span>ou</span>
                </div>
                <div className="form-group">
                  <label>Uploader une image</label>
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="file-upload-input"
                    />
                    <span className="file-upload-button">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Choisir un fichier
                    </span>
                  </label>
                </div>
              </div>
              <div className="avatar-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowAvatarModal(false)
                    setAvatarUrl(profile?.avatar || '')
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAvatar}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Image Change Modal */}
      {showBackgroundModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowBackgroundModal(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>Changer l'image de fond</h3>
              <button className="avatar-modal-close" onClick={() => setShowBackgroundModal(false)}>×</button>
            </div>
            <div className="avatar-modal-content">
              <div className="background-preview" style={{ backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {!backgroundUrl && (
                  <div className="background-preview-placeholder">
                    <span>Image de fond</span>
                  </div>
                )}
              </div>
              <div className="avatar-options">
                <div className="form-group">
                  <label>URL de l'image</label>
                  <input
                    type="url"
                    value={backgroundUrl}
                    onChange={handleBackgroundUrlChange}
                    placeholder="https://example.com/background.jpg"
                    className="avatar-url-input"
                  />
                  <small className="form-hint">Collez l'URL de votre image de fond</small>
                </div>
              </div>
              <div className="avatar-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowBackgroundModal(false)
                    setBackgroundUrl(profile?.backgroundImage || '')
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveBackground}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDetail
