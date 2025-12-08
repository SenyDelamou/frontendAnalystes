import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ParticipantsModal from '../components/ParticipantsModal'
import './ProjectDetail.css'

const ProjectDetail = () => {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)

  useEffect(() => {
    const loadProject = () => {
      setLoading(true)
      
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const found = projects.find(p => p.id === parseInt(id))
      
      if (found) {
        setProject(found)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    loadProject()
  }, [id])

  const getStatusBadge = (status) => {
    const badges = {
      'recruiting': { text: '🔍 Recrutement', class: 'status-recruiting' },
      'active': { text: '🚀 En cours', class: 'status-active' },
      'completed': { text: '✅ Terminé', class: 'status-completed' }
    }
    return badges[status] || badges['recruiting']
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleJoinProject = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour rejoindre un projet')
      navigate('/login')
      return
    }
    
    if (!project) return
    
    // Vérifier si le projet est plein
    if (project.members >= project.maxMembers) {
      alert('Ce projet a atteint le nombre maximum de membres!')
      return
    }
    
    // Vérifier si l'utilisateur participe déjà
    const membersList = project.membersList || []
    const isAlreadyMember = membersList.some(m => m.userId === user.id)
    
    if (isAlreadyMember) {
      alert('Vous participez déjà à ce projet!')
      return
    }
    
    // Ajouter l'utilisateur à la liste des membres
    const newMember = {
      id: Date.now(),
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      role: 'Member',
      joinedAt: new Date().toISOString()
    }
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const updated = projects.map(p => {
      if (p.id === project.id) {
        const updatedMembersList = [...(p.membersList || []), newMember]
        return { 
          ...p, 
          members: updatedMembersList.length,
          membersList: updatedMembersList
        }
      }
      return p
    })
    
    localStorage.setItem('projects', JSON.stringify(updated))
    setProject({ 
      ...project, 
      members: (project.members || 0) + 1,
      membersList: [...(project.membersList || []), newMember]
    })
    alert('Vous avez rejoint le projet avec succès!')
  }

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="container">
          <div className="project-detail card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Chargement du projet...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="container">
          <div className="project-detail card">
            <p>Projet non trouvé</p>
            <Link to="/projects" className="btn btn-primary">Retour aux projets</Link>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(project.status)
  const membersList = project.membersList || []
  const isMember = isAuthenticated && membersList.some(m => m.userId === user?.id)
  const isOwner = isAuthenticated && project.owner?.id === user?.id

  return (
    <div className="project-detail-page">
      <div className="container">
        <Link to="/projects" className="back-link">← Retour aux projets</Link>
        
        <div className="project-detail card">
          <div className="project-detail-header">
            <div className="project-status-badges">
              <span className={`status-badge ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>
            <h1>{project.title}</h1>
          </div>

          <div className="project-detail-meta">
            <div className="project-owner-info">
              <div className="owner-avatar">
                {project.owner?.avatar ? (
                  <img src={project.owner.avatar} alt={project.owner.name} />
                ) : (
                  <span>{project.owner?.name?.charAt(0) || 'O'}</span>
                )}
              </div>
              <div>
                <div className="owner-label">Propriétaire</div>
                <div className="owner-name">{project.owner?.name || 'Propriétaire'}</div>
              </div>
            </div>
            <div className="project-stats">
              <div className="stat-item">
                <span className="stat-label">👥 Membres</span>
                <button
                  className="stat-value-link"
                  onClick={() => setShowParticipantsModal(true)}
                  disabled={!project.members || project.members === 0}
                >
                  {project.members || 0}/{project.maxMembers}
                </button>
              </div>
              {project.createdAt && (
                <div className="stat-item">
                  <span className="stat-label">📅 Créé le</span>
                  <span className="stat-value">{formatDate(project.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="project-description">
            <h2>Description du projet</h2>
            <p>{project.description}</p>
          </div>

          {project.skills && project.skills.length > 0 && (
            <div className="project-skills-section">
              <h3>Compétences recherchées</h3>
              <div className="skills-list">
                {project.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Section Membres */}
          {membersList.length > 0 && (
            <div className="project-members-section">
              <h2>👥 Équipe du projet</h2>
              <div className="members-grid">
                {membersList.map((member, index) => (
                  <Link
                    key={member.id || index}
                    to={`/profiles/${member.userId}`}
                    className="member-card"
                  >
                    <div className="member-avatar">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        <span>{member.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                      {member.role === 'Owner' && (
                        <span className="owner-badge">👑</span>
                      )}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-role">
                        {member.role === 'Owner' ? 'Propriétaire' : 'Membre'}
                      </div>
                      <div className="member-joined">
                        Rejoint le {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="project-actions">
            {project.status === 'recruiting' && project.members < project.maxMembers && !isMember && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleJoinProject}
              >
                🚀 Rejoindre le projet
              </button>
            )}
            {isMember && (
              <div className="member-notice">
                <p>✅ Vous êtes membre de ce projet</p>
              </div>
            )}
            {project.members >= project.maxMembers && project.status === 'recruiting' && (
              <div className="full-notice">
                <p>⚠️ Ce projet a atteint le nombre maximum de membres</p>
              </div>
            )}
            {project.status === 'active' && (
              <div className="active-notice">
                <p>🚀 Ce projet est en cours d'exécution</p>
              </div>
            )}
            {project.status === 'completed' && (
              <div className="completed-notice">
                <p>✅ Ce projet est terminé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal des participants */}
      {showParticipantsModal && project && (
        <ParticipantsModal
          challenge={project}
          onClose={() => setShowParticipantsModal(false)}
        />
      )}
    </div>
  )
}

export default ProjectDetail

