import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import ConfirmModal from '../components/ConfirmModal'
import './Admin.css'

const Admin = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalChallenges: 0,
    totalResources: 0,
    totalTopics: 0,
    totalDonations: 0,
    donationsAmount: 0,
    donationsThisMonth: 0
  })
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [challenges, setChallenges] = useState([])
  const [resources, setResources] = useState([])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'recruiting',
    skills: '',
    maxMembers: 5
  })
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    status: 'active',
    difficulty: 'Intermédiaire',
    prize: '',
    deadline: '',
    skills: ''
  })
  const [resourceForm, setResourceForm] = useState({
    title: '',
    content: '',
    category: '',
    downloadLink: '',
    fileSize: '',
    format: '',
    tags: '',
    difficulty: '',
    language: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!isAdmin) {
      navigate('/dashboard')
      return
    }

    // Load all data for admin
    loadAdminData()
  }, [isAuthenticated, isAdmin, navigate])

  const loadAdminData = () => {
    // Load users from localStorage
    // First, get current user
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    
    // Load all users (in real app, this would be from API)
    let storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    
    // If no users stored, initialize with current user and sample users
    if (storedUsers.length === 0) {
      const sampleUsers = []
      if (currentUser) {
        sampleUsers.push(currentUser)
      }
      sampleUsers.push(
        { id: Date.now() + 1, name: 'Mamadou Diallo', email: 'mamadou@example.com', role: 'user', joinedAt: new Date().toISOString() },
        { id: Date.now() + 2, name: 'Aissatou Bah', email: 'aissatou@example.com', role: 'user', joinedAt: new Date().toISOString() }
      )
      setUsers(sampleUsers)
      localStorage.setItem('users', JSON.stringify(sampleUsers))
    } else {
      // Ensure current user is in the list
      if (currentUser && !storedUsers.find(u => u.id === currentUser.id)) {
        storedUsers.push(currentUser)
        localStorage.setItem('users', JSON.stringify(storedUsers))
      }
      setUsers(storedUsers)
    }

    // Load projects
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
    setProjects(storedProjects)

    // Load challenges
    const storedChallenges = JSON.parse(localStorage.getItem('challenges') || '[]')
    setChallenges(storedChallenges)

    // Load resources
    const storedResources = JSON.parse(localStorage.getItem('articles') || '[]')
    setResources(storedResources)

    // Load donations
    const storedDonations = JSON.parse(localStorage.getItem('donations') || '[]')
    const donationsTotal = storedDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
    const now = new Date()
    const donationsThisMonth = storedDonations.filter(d => {
      const donationDate = new Date(d.createdAt)
      return donationDate.getMonth() === now.getMonth() && 
             donationDate.getFullYear() === now.getFullYear()
    }).reduce((sum, donation) => sum + (donation.amount || 0), 0)

    // Calculate stats
    setStats({
      totalUsers: storedUsers.length || 3,
      totalProjects: storedProjects.length,
      totalChallenges: storedChallenges.length,
      totalResources: storedResources.length,
      totalTopics: JSON.parse(localStorage.getItem('topics') || '[]').length,
      totalDonations: storedDonations.length,
      donationsAmount: donationsTotal,
      donationsThisMonth: donationsThisMonth
    })
  }

  const handleDeleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le projet',
      message: `Êtes-vous sûr de vouloir supprimer le projet "${project?.title || 'ce projet'}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: () => {
        const updated = projects.filter(p => p.id !== projectId)
        setProjects(updated)
        localStorage.setItem('projects', JSON.stringify(updated))
        loadAdminData()
      }
    })
  }

  const handleDeleteChallenge = (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId)
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le défi',
      message: `Êtes-vous sûr de vouloir supprimer le défi "${challenge?.title || 'ce défi'}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: () => {
        const updated = challenges.filter(c => c.id !== challengeId)
        setChallenges(updated)
        localStorage.setItem('challenges', JSON.stringify(updated))
        loadAdminData()
      }
    })
  }

  const handleDeleteResource = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId)
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer la ressource',
      message: `Êtes-vous sûr de vouloir supprimer la ressource "${resource?.title || 'cette ressource'}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: () => {
        const updated = resources.filter(r => r.id !== resourceId)
        setResources(updated)
        localStorage.setItem('articles', JSON.stringify(updated))
        loadAdminData()
      }
    })
  }

  const handleToggleUserRole = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (user.id === userId && targetUser?.role === 'admin') {
      setConfirmModal({
        isOpen: true,
        title: 'Action impossible',
        message: 'Vous ne pouvez pas rétrograder votre propre compte administrateur.',
        type: 'warning',
        onConfirm: () => {}
      })
      return
    }

    const newRole = targetUser?.role === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'promouvoir en administrateur' : 'rétrograder en utilisateur'
    
    setConfirmModal({
      isOpen: true,
      title: `${newRole === 'admin' ? 'Promouvoir' : 'Rétrograder'} l'utilisateur`,
      message: `Êtes-vous sûr de vouloir ${action} "${targetUser?.name || 'cet utilisateur'}" ?`,
      type: 'info',
      onConfirm: () => {
        const updated = users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
        setUsers(updated)
        localStorage.setItem('users', JSON.stringify(updated))
        
        // Update current user if it's the one being modified
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
        if (currentUser && currentUser.id === userId) {
          const updatedUser = updated.find(u => u.id === userId)
          if (updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser))
            window.location.reload() // Reload to update context
          }
        }
        
        loadAdminData()
      }
    })
  }

  const handleDeleteUser = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (user.id === userId) {
      setConfirmModal({
        isOpen: true,
        title: 'Action impossible',
        message: 'Vous ne pouvez pas supprimer votre propre compte administrateur.',
        type: 'warning',
        onConfirm: () => {}
      })
      return
    }
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${targetUser?.name || 'cet utilisateur'}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: () => {
        const updated = users.filter(u => u.id !== userId)
        setUsers(updated)
        localStorage.setItem('users', JSON.stringify(updated))
        loadAdminData()
      }
    })
  }

  const handleCreateProject = (e) => {
    e.preventDefault()
    
    const skillsArray = projectForm.skills ? projectForm.skills.split(',').map(s => s.trim()).filter(s => s) : []
    
    const newProject = {
      id: Date.now(),
      title: projectForm.title,
      description: projectForm.description,
      owner: { id: user.id, name: user.name, avatar: user.avatar },
      status: projectForm.status,
      skills: skillsArray,
      members: 1,
      maxMembers: parseInt(projectForm.maxMembers) || 5,
      membersList: [{
        id: 1,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        role: 'Owner',
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    }

    const updatedProjects = [newProject, ...projects]
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    
    // Dispatch custom event to notify other pages
    window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: updatedProjects }))
    
    // Reset form and close modal
    setProjectForm({
      title: '',
      description: '',
      status: 'recruiting',
      skills: '',
      maxMembers: 5
    })
    setShowProjectModal(false)
    loadAdminData()
  }

  const handleCreateChallenge = (e) => {
    e.preventDefault()
    
    const skillsArray = challengeForm.skills ? challengeForm.skills.split(',').map(s => s.trim()).filter(s => s) : []
    
    const newChallenge = {
      id: Date.now(),
      title: challengeForm.title,
      description: challengeForm.description,
      organizer: { id: user.id, name: user.name, avatar: user.avatar },
      status: challengeForm.status,
      difficulty: challengeForm.difficulty,
      prize: challengeForm.prize,
      participants: 0,
      deadline: challengeForm.deadline,
      skills: skillsArray,
      createdAt: new Date().toISOString()
    }

    const updatedChallenges = [newChallenge, ...challenges]
    setChallenges(updatedChallenges)
    localStorage.setItem('challenges', JSON.stringify(updatedChallenges))
    
    // Dispatch custom event to notify other pages
    window.dispatchEvent(new CustomEvent('challengesUpdated', { detail: updatedChallenges }))
    
    // Reset form and close modal
    setChallengeForm({
      title: '',
      description: '',
      status: 'active',
      difficulty: 'Intermédiaire',
      prize: '',
      deadline: '',
      skills: ''
    })
    setShowChallengeModal(false)
    loadAdminData()
  }

  const handleCreateResource = (e) => {
    e.preventDefault()
    
    const tagsArray = resourceForm.tags ? resourceForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const resourceData = {
      id: Date.now(),
      title: resourceForm.title,
      content: resourceForm.content,
      category: resourceForm.category,
      downloadLink: resourceForm.downloadLink,
      fileSize: resourceForm.fileSize,
      format: resourceForm.format,
      tags: tagsArray,
      difficulty: resourceForm.difficulty,
      language: resourceForm.language,
      excerpt: resourceForm.content.substring(0, 150) + (resourceForm.content.length > 150 ? '...' : ''),
      author: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      downloads: 0
    }

    // Add category-specific fields if needed
    if (resourceForm.category === 'Dataset') {
      // These would be added if form had these fields
    }

    const updatedResources = [resourceData, ...resources]
    setResources(updatedResources)
    localStorage.setItem('articles', JSON.stringify(updatedResources))
    
    // Dispatch custom event to notify other pages
    window.dispatchEvent(new CustomEvent('articlesUpdated', { detail: updatedResources }))
    
    // Reset form and close modal
    setResourceForm({
      title: '',
      content: '',
      category: '',
      downloadLink: '',
      fileSize: '',
      format: '',
      tags: '',
      difficulty: '',
      language: ''
    })
    setShowResourceModal(false)
    loadAdminData()
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="admin-page">
      <PageHeader
        title="Administration"
        subtitle="Gérez la plateforme, les utilisateurs, projets et défis"
        imageUrls={[
          'https://images.unsplash.com/photo-1521737711867-e3b97375f901?w=1920&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
          'https://images.unsplash.com/photo-1521737711867-e3b97375f901?w=1920&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="admin-layout">
          {/* Sidebar */}
          <div className="admin-sidebar">
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="admin-user-details">
                <div className="admin-name">{user?.name}</div>
                <div className="admin-role">Administrateur</div>
              </div>
            </div>

            <nav className="admin-nav">
              <div className="admin-nav-header">
                <h3>Navigation</h3>
              </div>
              <button
                className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span>Tableau de bord</span>
              </button>
              <button
                className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="nav-icon">👥</span>
                <span>Utilisateurs</span>
              </button>
              <button
                className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <span className="nav-icon">💼</span>
                <span>Projets</span>
              </button>
              <button
                className={`admin-nav-item ${activeTab === 'challenges' ? 'active' : ''}`}
                onClick={() => setActiveTab('challenges')}
              >
                <span className="nav-icon">🏆</span>
                <span>Défis</span>
              </button>
              <button
                className={`admin-nav-item ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                <span className="nav-icon">📚</span>
                <span>Ressources</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="admin-content">
            {activeTab === 'dashboard' && (
              <div className="admin-dashboard">
                <h2>Tableau de bord</h2>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalUsers}</div>
                      <div className="admin-stat-label">Utilisateurs</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">💼</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalProjects}</div>
                      <div className="admin-stat-label">Projets</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">🏆</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalChallenges}</div>
                      <div className="admin-stat-label">Défis</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">📚</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalResources}</div>
                      <div className="admin-stat-label">Ressources</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">💬</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalTopics}</div>
                      <div className="admin-stat-label">Sujets Forum</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">💝</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">{stats.totalDonations}</div>
                      <div className="admin-stat-label">Dons</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">💰</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">
                        {stats.donationsAmount.toLocaleString('fr-GN')} GNF
                      </div>
                      <div className="admin-stat-label">Total Collecté</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">📅</div>
                    <div className="admin-stat-info">
                      <div className="admin-stat-value">
                        {stats.donationsThisMonth.toLocaleString('fr-GN')} GNF
                      </div>
                      <div className="admin-stat-label">Ce Mois</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Gestion des utilisateurs</h2>
                  <div className="admin-section-count">{users.length} utilisateurs</div>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`role-badge ${u.role}`}>
                              {u.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                            </span>
                          </td>
                          <td>{new Date(u.joinedAt).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="btn-action btn-toggle"
                                onClick={() => handleToggleUserRole(u.id)}
                                title={u.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir en admin'}
                              >
                                {u.role === 'admin' ? '⬇️' : '⬆️'}
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  className="btn-action btn-delete"
                                  onClick={() => handleDeleteUser(u.id)}
                                  title="Supprimer"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Gestion des projets</h2>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div className="admin-section-count">{projects.length} projets</div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowProjectModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>➕</span>
                      <span>Créer un projet</span>
                    </button>
                  </div>
                </div>
                <div className="admin-list">
                  {projects.length === 0 ? (
                    <div className="admin-empty">Aucun projet pour le moment</div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="admin-item-card">
                        <div className="admin-item-content">
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                          <div className="admin-item-meta">
                            <span>👤 {project.owner?.name || 'Inconnu'}</span>
                            <span>📅 {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span className={`status-badge status-${project.status}`}>
                              {project.status === 'recruiting' && '🔍 Recrutement'}
                              {project.status === 'active' && '🚀 En cours'}
                              {project.status === 'completed' && '✅ Terminé'}
                            </span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteProject(project.id)}
                            title="Supprimer"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Gestion des défis</h2>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div className="admin-section-count">{challenges.length} défis</div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowChallengeModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>➕</span>
                      <span>Lancer un défi</span>
                    </button>
                  </div>
                </div>
                <div className="admin-list">
                  {challenges.length === 0 ? (
                    <div className="admin-empty">Aucun défi pour le moment</div>
                  ) : (
                    challenges.map((challenge) => (
                      <div key={challenge.id} className="admin-item-card">
                        <div className="admin-item-content">
                          <h3>{challenge.title}</h3>
                          <p>{challenge.description}</p>
                          <div className="admin-item-meta">
                            <span>👤 {challenge.organizer?.name || 'Inconnu'}</span>
                            <span>📅 {new Date(challenge.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span>👥 {challenge.participants || 0} participants</span>
                            <span className={`status-badge status-${challenge.status}`}>
                              {challenge.status === 'active' && '🚀 Actif'}
                              {challenge.status === 'upcoming' && '📅 À venir'}
                              {challenge.status === 'completed' && '✅ Terminé'}
                            </span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            title="Supprimer"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Gestion des ressources</h2>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div className="admin-section-count">{resources.length} ressources</div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowResourceModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>➕</span>
                      <span>Ajouter une ressource</span>
                    </button>
                  </div>
                </div>
                <div className="admin-list">
                  {resources.length === 0 ? (
                    <div className="admin-empty">Aucune ressource pour le moment</div>
                  ) : (
                    resources.map((resource) => (
                      <div key={resource.id} className="admin-item-card">
                        <div className="admin-item-content">
                          <h3>{resource.title}</h3>
                          <p>{resource.excerpt || resource.content?.substring(0, 150)}</p>
                          <div className="admin-item-meta">
                            <span>👤 {resource.author?.name || 'Inconnu'}</span>
                            <span>📅 {new Date(resource.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span>📊 {resource.category}</span>
                            <span>👁️ {resource.views || 0} vues</span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteResource(resource.id)}
                            title="Supprimer"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Créer Projet */}
      {showProjectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Créer un nouveau projet</h3>
              <button className="admin-modal-close" onClick={() => setShowProjectModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateProject} className="admin-modal-form">
              <div className="form-group">
                <label>Titre du projet *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  placeholder="Ex: Analyse des données de santé en Guinée"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                  rows="4"
                  placeholder="Décrivez le projet en détail..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    required
                  >
                    <option value="recruiting">🔍 Recrutement</option>
                    <option value="active">🚀 En cours</option>
                    <option value="completed">✅ Terminé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nombre maximum de membres *</label>
                  <input
                    type="number"
                    value={projectForm.maxMembers}
                    onChange={(e) => setProjectForm({ ...projectForm, maxMembers: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="50"
                    required
                    placeholder="Ex: 5"
                  />
                  <small className="form-hint">Nombre maximum de participants au projet</small>
                </div>
              </div>
              <div className="form-group">
                <label>Compétences requises (séparées par des virgules)</label>
                <input
                  type="text"
                  value={projectForm.skills}
                  onChange={(e) => setProjectForm({ ...projectForm, skills: e.target.value })}
                  placeholder="Ex: Python, Pandas, Visualisation"
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowProjectModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Créer Ressource */}
      {showResourceModal && (
        <div className="admin-modal-overlay" onClick={() => setShowResourceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Ajouter une ressource</h3>
              <button className="admin-modal-close" onClick={() => setShowResourceModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateResource} className="admin-modal-form">
              <div className="form-group">
                <label>Titre de la ressource *</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  required
                  placeholder="Ex: Dataset des données économiques de Guinée 2023"
                />
              </div>
              <div className="form-group">
                <label>Type de ressource *</label>
                <select
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Dataset">📊 Dataset</option>
                  <option value="Tutoriel">📚 Tutoriel</option>
                  <option value="Outil">🛠️ Outil</option>
                  <option value="Template">📋 Template</option>
                  <option value="Documentation">📖 Documentation</option>
                  <option value="Code">💻 Code/Script</option>
                  <option value="Livre">📗 Livre/E-book</option>
                  <option value="Autre">📦 Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description/Contenu *</label>
                <textarea
                  value={resourceForm.content}
                  onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })}
                  required
                  rows="5"
                  placeholder="Décrivez la ressource en détail..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lien de téléchargement</label>
                  <input
                    type="url"
                    value={resourceForm.downloadLink}
                    onChange={(e) => setResourceForm({ ...resourceForm, downloadLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Format</label>
                  <input
                    type="text"
                    value={resourceForm.format}
                    onChange={(e) => setResourceForm({ ...resourceForm, format: e.target.value })}
                    placeholder="Ex: CSV, PDF, ZIP"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Taille du fichier</label>
                  <input
                    type="text"
                    value={resourceForm.fileSize}
                    onChange={(e) => setResourceForm({ ...resourceForm, fileSize: e.target.value })}
                    placeholder="Ex: 2.5 MB"
                  />
                </div>
                <div className="form-group">
                  <label>Niveau de difficulté</label>
                  <select
                    value={resourceForm.difficulty}
                    onChange={(e) => setResourceForm({ ...resourceForm, difficulty: e.target.value })}
                  >
                    <option value="">Tous niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Langue</label>
                  <input
                    type="text"
                    value={resourceForm.language}
                    onChange={(e) => setResourceForm({ ...resourceForm, language: e.target.value })}
                    placeholder="Ex: Français, Anglais"
                  />
                </div>
                <div className="form-group">
                  <label>Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={resourceForm.tags}
                    onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                    placeholder="Ex: données, analyse, python"
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowResourceModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter la ressource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lancer Défi */}
      {showChallengeModal && (
        <div className="admin-modal-overlay" onClick={() => setShowChallengeModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Lancer un nouveau défi</h3>
              <button className="admin-modal-close" onClick={() => setShowChallengeModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateChallenge} className="admin-modal-form">
              <div className="form-group">
                <label>Titre du défi *</label>
                <input
                  type="text"
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  required
                  placeholder="Ex: Défi : Analyse des données de transport"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  required
                  rows="4"
                  placeholder="Décrivez le défi en détail..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={challengeForm.status}
                    onChange={(e) => setChallengeForm({ ...challengeForm, status: e.target.value })}
                    required
                  >
                    <option value="upcoming">📅 À venir</option>
                    <option value="active">🚀 Actif</option>
                    <option value="completed">✅ Terminé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulté *</label>
                  <select
                    value={challengeForm.difficulty}
                    onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })}
                    required
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix/Récompense</label>
                  <input
                    type="text"
                    value={challengeForm.prize}
                    onChange={(e) => setChallengeForm({ ...challengeForm, prize: e.target.value })}
                    placeholder="Ex: 500 000 GNF"
                  />
                </div>
                <div className="form-group">
                  <label>Date limite</label>
                  <input
                    type="date"
                    value={challengeForm.deadline}
                    onChange={(e) => setChallengeForm({ ...challengeForm, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Compétences requises (séparées par des virgules)</label>
                <input
                  type="text"
                  value={challengeForm.skills}
                  onChange={(e) => setChallengeForm({ ...challengeForm, skills: e.target.value })}
                  placeholder="Ex: Python, Machine Learning, Visualisation"
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowChallengeModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Lancer le défi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  )
}

export default Admin

