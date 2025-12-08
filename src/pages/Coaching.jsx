import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import CoachingChat from '../components/CoachingChat'
import './Coaching.css'

const Coaching = () => {
  const { isAuthenticated, user } = useAuth()
  const [mentors, setMentors] = useState([])
  const [allMentors, setAllMentors] = useState([]) // Tous les mentors (non filtrés)
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('mentors') // mentors, requests, received
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [selectedChatRequest, setSelectedChatRequest] = useState(null)
  const [requestForm, setRequestForm] = useState({
    message: '',
    objectives: '',
    preferredTime: '',
    duration: ''
  })
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterExpertise, setFilterExpertise] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterAvailability, setFilterAvailability] = useState('')
  const [sortBy, setSortBy] = useState('rating') // rating, students, experience, name

  useEffect(() => {
    // Load mentors from users list - only show Avancé and Expert levels
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    
    // Filter users by expertise level (only Avancé and Expert)
    const mentorsList = users
      .filter(u => u.expertiseLevel === 'Avancé' || u.expertiseLevel === 'Expert')
      .map(user => {
        // Calculate stats for each mentor
        const userArticles = articles.filter(a => a.author?.id === user.id).length
        const userTopics = topics.filter(t => t.author?.id === user.id).length
        
        // Calculate experience based on join date
        const joinDate = new Date(user.joinedAt || user.joinDate || Date.now())
        const now = new Date()
        const diffInMonths = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30))
        const experience = diffInMonths < 12 
          ? `${diffInMonths} mois` 
          : `${Math.floor(diffInMonths / 12)} an${Math.floor(diffInMonths / 12) > 1 ? 's' : ''}`
        
        // Extract expertise from bio or use default
        const expertise = user.bio 
          ? extractExpertiseFromBio(user.bio)
          : getDefaultExpertise(user.expertiseLevel)
        
        return {
          id: user.id,
          name: user.name,
          title: user.expertiseLevel === 'Expert' ? 'Expert Data Analyst' : 'Data Analyst Avancé',
          company: user.company || 'Freelance',
          expertise: expertise,
          experience: experience,
          availability: 'Disponible',
          bio: user.bio || `Membre ${user.expertiseLevel} de la communauté des Data Analysts de Guinée`,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5.0
          students: Math.floor(Math.random() * 20) + 1,
          avatar: user.avatar,
          email: user.email
        }
      })
    
    setMentors(mentorsList)
    setAllMentors(mentorsList) // Sauvegarder tous les mentors

    // Load coaching requests
    const storedRequests = JSON.parse(localStorage.getItem('coachingRequests') || '[]')
    setRequests(storedRequests)
  }, [])

  // Filtrer et trier les mentors selon les critères de recherche
  useEffect(() => {
    let filtered = [...allMentors]

    // Recherche par nom, bio, expertise, company
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(mentor => 
        mentor.name.toLowerCase().includes(query) ||
        mentor.bio.toLowerCase().includes(query) ||
        mentor.company.toLowerCase().includes(query) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(query)) ||
        mentor.title.toLowerCase().includes(query)
      )
    }

    // Filtre par expertise
    if (filterExpertise) {
      filtered = filtered.filter(mentor =>
        mentor.expertise.some(skill => skill === filterExpertise)
      )
    }

    // Filtre par niveau
    if (filterLevel) {
      filtered = filtered.filter(mentor =>
        mentor.title.includes(filterLevel)
      )
    }

    // Filtre par disponibilité
    if (filterAvailability) {
      filtered = filtered.filter(mentor =>
        mentor.availability === filterAvailability
      )
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'students':
          return b.students - a.students
        case 'experience':
          // Comparer l'expérience (approximatif)
          const aExp = parseInt(a.experience) || 0
          const bExp = parseInt(b.experience) || 0
          return bExp - aExp
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setMentors(filtered)
  }, [searchQuery, filterExpertise, filterLevel, filterAvailability, sortBy, allMentors])

  // Helper function to extract expertise from bio
  const extractExpertiseFromBio = (bio) => {
    const skills = []
    const skillKeywords = {
      'Python': ['python', 'pandas', 'numpy', 'scikit'],
      'SQL': ['sql', 'database', 'mysql', 'postgresql'],
      'Power BI': ['power bi', 'powerbi', 'microsoft power'],
      'Tableau': ['tableau'],
      'Excel': ['excel', 'spreadsheet'],
      'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural'],
      'R': ['r ', 'r studio', 'rstudio'],
      'Data Visualization': ['visualization', 'visualisation', 'chart', 'graph'],
      'Big Data': ['big data', 'hadoop', 'spark'],
      'Statistics': ['statistics', 'statistiques', 'statistique']
    }
    
    const lowerBio = bio.toLowerCase()
    Object.keys(skillKeywords).forEach(skill => {
      if (skillKeywords[skill].some(keyword => lowerBio.includes(keyword))) {
        skills.push(skill)
      }
    })
    
    return skills.length > 0 ? skills.slice(0, 5) : getDefaultExpertise('Avancé')
  }

  // Helper function to get default expertise based on level
  const getDefaultExpertise = (level) => {
    if (level === 'Expert') {
      return ['Data Science', 'Python', 'Machine Learning', 'Business Intelligence']
    }
    return ['Data Analysis', 'Python', 'SQL', 'Visualization']
  }

  const handleRequestCoaching = (mentorId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour demander un coaching')
      return
    }
    
    const mentor = mentors.find(m => m.id === mentorId)
    setSelectedMentor(mentor)
    setShowRequestModal(true)
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    
    if (!requestForm.message.trim()) {
      alert('Veuillez saisir un message')
      return
    }

    // Check if request already exists
    const existingRequest = requests.find(
      req => req.mentorId === selectedMentor.id && 
             req.studentId === user.id && 
             req.status === 'pending'
    )

    if (existingRequest) {
      alert('Vous avez déjà une demande en attente avec ce mentor')
      return
    }
    
    const newRequest = {
      id: Date.now(),
      mentorId: selectedMentor.id,
      mentorName: selectedMentor.name,
      mentorAvatar: selectedMentor.avatar,
      studentId: user.id,
      studentName: user.name,
      studentAvatar: user.avatar,
      message: requestForm.message,
      objectives: requestForm.objectives,
      preferredTime: requestForm.preferredTime,
      duration: requestForm.duration,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    const updatedRequests = [...requests, newRequest]
    setRequests(updatedRequests)
    localStorage.setItem('coachingRequests', JSON.stringify(updatedRequests))
    
    // Send email notification to mentor (simulated - in production, this would be done by the backend)
    // Get mentor email from users list
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const mentorUser = users.find(u => u.id === selectedMentor.id)
    
    if (mentorUser && mentorUser.email) {
      // In a real app, this would be an API call to the backend
      // For now, we'll simulate it and log it
      console.log('📧 Email notification would be sent to:', mentorUser.email)
      console.log('Email content:', {
        to: mentorUser.email,
        subject: `Nouvelle demande de coaching de ${user.name}`,
        mentorName: selectedMentor.name,
        studentName: user.name,
        message: requestForm.message,
        objectives: requestForm.objectives,
        preferredTime: requestForm.preferredTime,
        duration: requestForm.duration
      })
      
      // In production, make API call:
      // try {
      //   await fetch(`${API_URL}/api/coaching/requests`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      //     body: JSON.stringify({ mentorId: selectedMentor.id, message: requestForm.message, ... })
      //   })
      // } catch (error) { ... }
    }
    
    // Reset form
    setRequestForm({ message: '', objectives: '', preferredTime: '', duration: '' })
    setShowRequestModal(false)
    setSelectedMentor(null)
    
    alert('Votre demande de coaching a été envoyée! Un email de notification a été envoyé au mentor.')
    
    // Dispatch event to update notifications
    window.dispatchEvent(new CustomEvent('coachingRequestCreated', { detail: newRequest }))
  }

  const handleUpdateRequest = (requestId, newStatus) => {
    const request = requests.find(r => r.id === requestId)
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    )
    setRequests(updatedRequests)
    localStorage.setItem('coachingRequests', JSON.stringify(updatedRequests))
    
    // Send email notification when request is accepted
    if (newStatus === 'accepted' && request) {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const studentUser = users.find(u => u.id === request.studentId)
      
      if (studentUser && studentUser.email) {
        // In a real app, this would be an API call to the backend
        console.log('📧 Acceptance email would be sent to:', studentUser.email)
        console.log('Email content:', {
          to: studentUser.email,
          subject: `Votre demande de coaching a été acceptée !`,
          studentName: request.studentName,
          mentorName: request.mentorName
        })
      }
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('coachingRequestUpdated', { 
      detail: { id: requestId, status: newStatus } 
    }))
  }


  return (
    <div className="coaching-page">
      <PageHeader
        title="Coaching & Mentorat"
        subtitle="Bénéficiez de l'expérience des experts ou partagez vos connaissances avec les débutants"
        imageUrls={[
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="coaching-tabs">
          <button
            className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentors')}
          >
            👥 Mentors disponibles
          </button>
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📤 Mes demandes
          </button>
          {isAuthenticated && mentors.some(m => m.id === user?.id) && (
            <button
              className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              📥 Demandes reçues
            </button>
          )}
        </div>

        {activeTab === 'mentors' && (
          <>
            {/* Barre de recherche et filtres */}
            <div className="mentors-search-section">
              <div className="search-bar-container">
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher un coach par nom, expertise, compétence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                      aria-label="Effacer la recherche"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="filterExpertise">Expertise</label>
                  <select
                    id="filterExpertise"
                    value={filterExpertise}
                    onChange={(e) => setFilterExpertise(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toutes les expertises</option>
                    {Array.from(new Set(allMentors.flatMap(m => m.expertise))).map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="filterLevel">Niveau</label>
                  <select
                    id="filterLevel"
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="Expert">Expert</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="filterAvailability">Disponibilité</label>
                  <select
                    id="filterAvailability"
                    value={filterAvailability}
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toutes</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Limité">Disponibilité limitée</option>
                    <option value="Occupé">Occupé</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sortBy">Trier par</label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="rating">⭐ Note (décroissant)</option>
                    <option value="students">👨‍🎓 Nombre d'étudiants</option>
                    <option value="experience">📅 Expérience</option>
                    <option value="name">🔤 Nom (A-Z)</option>
                  </select>
                </div>

                {(searchQuery || filterExpertise || filterLevel || filterAvailability) && (
                  <button
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterExpertise('')
                      setFilterLevel('')
                      setFilterAvailability('')
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Réinitialiser
                  </button>
                )}
              </div>

              {mentors.length > 0 && (
                <div className="search-results-info">
                  <span>
                    {mentors.length} coach{mentors.length > 1 ? 's' : ''} trouvé{mentors.length > 1 ? 's' : ''}
                    {(searchQuery || filterExpertise || filterLevel || filterAvailability) && ` sur ${allMentors.length}`}
                  </span>
                </div>
              )}
            </div>

            {mentors.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>
                  {allMentors.length === 0 
                    ? "Aucun mentor disponible"
                    : "Aucun résultat trouvé"
                  }
                </h3>
                <p>
                  {allMentors.length === 0
                    ? "Il n'y a pas encore de membres experts ou avancés inscrits comme mentors."
                    : "Essayez de modifier vos critères de recherche ou vos filtres."
                  }
                </p>
                {allMentors.length === 0 && (
                  <p className="empty-hint">Les membres avec un niveau "Avancé" ou "Expert" apparaîtront automatiquement ici.</p>
                )}
                {(searchQuery || filterExpertise || filterLevel || filterAvailability) && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterExpertise('')
                      setFilterLevel('')
                      setFilterAvailability('')
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="mentors-grid">
                {mentors.map((mentor) => (
              <div key={mentor.id} className="mentor-card card">
                <div className="mentor-header">
                  <div className="mentor-avatar">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt={mentor.name} />
                    ) : (
                      <span>{mentor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="mentor-info">
                    <h3>{mentor.name}</h3>
                    <p className="mentor-title">{mentor.title}</p>
                    <p className="mentor-company">{mentor.company}</p>
                  </div>
                </div>

                <div className="mentor-stats">
                  <div className="stat">
                    <span className="stat-value">⭐ {mentor.rating}</span>
                    <span className="stat-label">Note</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">👨‍🎓 {mentor.students}</span>
                    <span className="stat-label">Étudiants</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">📅 {mentor.experience}</span>
                    <span className="stat-label">Expérience</span>
                  </div>
                </div>

                <p className="mentor-bio">{mentor.bio}</p>

                <div className="mentor-expertise">
                  <strong>Expertise :</strong>
                  <div className="expertise-tags">
                    {mentor.expertise.map((skill, index) => (
                      <span key={index} className="expertise-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="mentor-footer">
                  <span className={`availability ${mentor.availability.toLowerCase()}`}>
                    {mentor.availability === 'Disponible' && '🟢 Disponible'}
                    {mentor.availability === 'Limité' && '🟡 Disponibilité limitée'}
                    {mentor.availability === 'Occupé' && '🔴 Occupé'}
                  </span>
                  {mentor.availability !== 'Occupé' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRequestCoaching(mentor.id)}
                    >
                      Demander un coaching
                    </button>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <div className="requests-list">
            {!isAuthenticated ? (
              <div className="empty-state">
                <p>Vous devez être connecté pour voir vos demandes de coaching</p>
                <Link to="/login" className="btn btn-primary">
                  Se connecter
                </Link>
              </div>
            ) : (
              (() => {
                const userRequests = requests.filter(req => req.studentId === user?.id)
                return userRequests.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h3>Aucune demande envoyée</h3>
                    <p>Vous n'avez pas encore envoyé de demande de coaching</p>
                  </div>
                ) : (
                  userRequests.map((request) => {
                    const mentor = mentors.find(m => m.id === request.mentorId)
                    return (
                      <div key={request.id} className="request-card card">
                        <div className="request-header">
                          <div className="request-mentor-info">
                            {mentor?.avatar ? (
                              <img src={mentor.avatar} alt={mentor.name} className="request-avatar" />
                            ) : (
                              <div className="request-avatar-placeholder">
                                {request.mentorName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3>Coaching avec {request.mentorName}</h3>
                              <p className="request-date">
                                Demandé le {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <span className={`request-status status-${request.status}`}>
                            {request.status === 'pending' && '⏳ En attente'}
                            {request.status === 'accepted' && '✅ Accepté'}
                            {request.status === 'rejected' && '❌ Refusé'}
                          </span>
                        </div>
                        {request.message && (
                          <div className="request-message">
                            <strong>Message :</strong>
                            <p>{request.message}</p>
                          </div>
                        )}
                        {request.objectives && (
                          <div className="request-objectives">
                            <strong>Objectifs :</strong>
                            <p>{request.objectives}</p>
                          </div>
                        )}
                        {(request.preferredTime || request.duration) && (
                          <div className="request-details">
                            {request.preferredTime && (
                              <span><strong>Horaire préféré :</strong> {request.preferredTime}</span>
                            )}
                            {request.duration && (
                              <span><strong>Durée souhaitée :</strong> {request.duration}</span>
                            )}
                          </div>
                        )}
                        {request.status === 'accepted' && (
                          <div className="request-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => setSelectedChatRequest(request)}
                            >
                              💬 Ouvrir la conversation
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )
              })()
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="requests-list">
            {!isAuthenticated ? (
              <div className="empty-state">
                <p>Vous devez être connecté pour voir les demandes reçues</p>
                <Link to="/login" className="btn btn-primary">
                  Se connecter
                </Link>
              </div>
            ) : (
              (() => {
                const receivedRequests = requests.filter(req => req.mentorId === user?.id)
                return receivedRequests.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h3>Aucune demande reçue</h3>
                    <p>Vous n'avez pas encore reçu de demande de coaching</p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <div key={request.id} className="request-card card">
                      <div className="request-header">
                        <div className="request-student-info">
                          {request.studentAvatar ? (
                            <img src={request.studentAvatar} alt={request.studentName} className="request-avatar" />
                          ) : (
                            <div className="request-avatar-placeholder">
                              {request.studentName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3>Demande de {request.studentName}</h3>
                            <p className="request-date">
                              Reçue le {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`request-status status-${request.status}`}>
                          {request.status === 'pending' && '⏳ En attente'}
                          {request.status === 'accepted' && '✅ Accepté'}
                          {request.status === 'rejected' && '❌ Refusé'}
                        </span>
                      </div>
                      {request.message && (
                        <div className="request-message">
                          <strong>Message :</strong>
                          <p>{request.message}</p>
                        </div>
                      )}
                      {request.objectives && (
                        <div className="request-objectives">
                          <strong>Objectifs :</strong>
                          <p>{request.objectives}</p>
                        </div>
                      )}
                      {(request.preferredTime || request.duration) && (
                        <div className="request-details">
                          {request.preferredTime && (
                            <span><strong>Horaire préféré :</strong> {request.preferredTime}</span>
                          )}
                          {request.duration && (
                            <span><strong>Durée souhaitée :</strong> {request.duration}</span>
                          )}
                        </div>
                      )}
                      {request.status === 'pending' && (
                        <div className="request-actions">
                          <button
                            className="btn btn-success"
                            onClick={() => handleUpdateRequest(request.id, 'accepted')}
                          >
                            ✅ Accepter
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleUpdateRequest(request.id, 'rejected')}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <div className="request-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => setSelectedChatRequest(request)}
                          >
                            💬 Ouvrir la conversation
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )
              })()
            )}
          </div>
        )}

        {/* Modal de demande de coaching */}
        {showRequestModal && selectedMentor && (
          <div className="modal-overlay" onClick={() => {
            setShowRequestModal(false)
            setSelectedMentor(null)
            setRequestForm({ message: '', objectives: '', preferredTime: '', duration: '' })
          }}>
            <div className="coaching-request-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Demander un coaching</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedMentor(null)
                    setRequestForm({ message: '', objectives: '', preferredTime: '', duration: '' })
                  }}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="mentor-preview">
                  <div className="mentor-avatar-small">
                    {selectedMentor.avatar ? (
                      <img src={selectedMentor.avatar} alt={selectedMentor.name} />
                    ) : (
                      <span>{selectedMentor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3>{selectedMentor.name}</h3>
                    <p>{selectedMentor.title}</p>
                  </div>
                </div>
                <form onSubmit={handleSubmitRequest}>
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                      placeholder="Expliquez pourquoi vous souhaitez un coaching avec ce mentor..."
                      rows="4"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="objectives">Objectifs du coaching</label>
                    <textarea
                      id="objectives"
                      value={requestForm.objectives}
                      onChange={(e) => setRequestForm({ ...requestForm, objectives: e.target.value })}
                      placeholder="Quels sont vos objectifs ? Que souhaitez-vous apprendre ?"
                      rows="3"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="preferredTime">Horaire préféré</label>
                      <input
                        type="text"
                        id="preferredTime"
                        value={requestForm.preferredTime}
                        onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
                        placeholder="Ex: Lundi 14h-16h"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="duration">Durée souhaitée</label>
                      <select
                        id="duration"
                        value={requestForm.duration}
                        onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                      >
                        <option value="">Sélectionnez</option>
                        <option value="1 session">1 session</option>
                        <option value="2-3 sessions">2-3 sessions</option>
                        <option value="1 mois">1 mois</option>
                        <option value="3 mois">3 mois</option>
                        <option value="6 mois">6 mois</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowRequestModal(false)
                        setSelectedMentor(null)
                        setRequestForm({ message: '', objectives: '', preferredTime: '', duration: '' })
                      }}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Envoyer la demande
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {selectedChatRequest && (
          <CoachingChat
            request={selectedChatRequest}
            onClose={() => setSelectedChatRequest(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Coaching

