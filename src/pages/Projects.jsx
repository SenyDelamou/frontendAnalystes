import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import ParticipantsModal from '../components/ParticipantsModal'
import './Projects.css'

const Projects = () => {
  const { isAuthenticated, user, isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all') // all, active, recruiting, completed
  const [selectedProject, setSelectedProject] = useState(null)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)

  useEffect(() => {
    // Load projects from localStorage
    let stored = JSON.parse(localStorage.getItem('projects') || '[]')
    
    // Migrer les projets existants pour ajouter membersList s'il n'existe pas
    stored = stored.map(project => {
      if (!project.membersList && project.members > 0) {
        // Générer une liste de membres simulés pour les projets existants
        const mockNames = [
          'Mamadou Diallo', 'Aissatou Bah', 'Ibrahima Camara', 'Fatoumata Diallo',
          'Ousmane Barry', 'Mariam Sow', 'Amadou Diallo', 'Aminata Keita'
        ]
        const membersList = []
        for (let i = 0; i < project.members; i++) {
          // Utiliser des IDs numériques cohérents (1, 2, 3, etc.)
          const userId = i + 1
          membersList.push({
            id: i + 1,
            userId: userId,
            name: mockNames[i % mockNames.length],
            avatar: null,
            role: i === 0 ? 'Owner' : 'Member',
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
        return { ...project, membersList }
      }
      if (!project.membersList) {
        return { ...project, membersList: [] }
      }
      return project
    })
    
    // Always use stored data if available, otherwise use samples
    if (stored.length > 0) {
      setProjects(stored)
      // Sauvegarder les projets migrés
      localStorage.setItem('projects', JSON.stringify(stored))
    } else if (stored.length === 0) {
      // Sample projects
      const sampleProjects = [
        {
          id: 1,
          title: 'Analyse des données de santé en Guinée',
          description: 'Projet d\'analyse des données de santé publique pour identifier les tendances et améliorer les services.',
          owner: { id: 1, name: 'Mamadou Diallo', avatar: null },
          status: 'recruiting',
          skills: ['Python', 'Pandas', 'Visualisation'],
          members: 2,
          maxMembers: 5,
          membersList: generateMockMembers(2, 1),
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Dashboard de suivi économique',
          description: 'Création d\'un dashboard interactif pour suivre les indicateurs économiques de la Guinée.',
          owner: { id: 2, name: 'Aissatou Bah', avatar: null },
          status: 'active',
          skills: ['Tableau', 'SQL', 'Power BI'],
          members: 4,
          maxMembers: 6,
          membersList: generateMockMembers(4, 2),
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Prédiction de la demande énergétique',
          description: 'Modèle de machine learning pour prédire la demande énergétique et optimiser la distribution.',
          owner: { id: 3, name: 'Ibrahima Camara', avatar: null },
          status: 'active',
          skills: ['Machine Learning', 'Python', 'Scikit-learn'],
          members: 3,
          maxMembers: 4,
          membersList: generateMockMembers(3, 3),
          createdAt: new Date().toISOString()
        }
      ]
      
      // Helper function to generate mock members
      function generateMockMembers(count, projectId) {
        const mockNames = [
          'Mamadou Diallo', 'Aissatou Bah', 'Ibrahima Camara', 'Fatoumata Diallo',
          'Ousmane Barry', 'Mariam Sow', 'Amadou Diallo', 'Aminata Keita'
        ]
        const members = []
        for (let i = 0; i < count; i++) {
          // Utiliser des IDs numériques cohérents (1, 2, 3, etc.)
          const userId = i + 1
          members.push({
            id: i + 1,
            userId: userId,
            name: mockNames[i % mockNames.length],
            avatar: null,
            role: i === 0 ? 'Owner' : 'Member',
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
        return members
      }
      setProjects(sampleProjects)
      localStorage.setItem('projects', JSON.stringify(sampleProjects))
    }
  }, [])

  // Reload projects when localStorage changes (for admin-created projects)
  useEffect(() => {
    const handleProjectsUpdate = (e) => {
      if (e.detail) {
        setProjects(e.detail)
      } else {
        const stored = JSON.parse(localStorage.getItem('projects') || '[]')
        if (stored.length > 0) {
          setProjects(stored)
        }
      }
    }

    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem('projects') || '[]')
      if (stored.length > 0) {
        setProjects(stored)
      }
    }

    window.addEventListener('projectsUpdated', handleProjectsUpdate)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const handleJoinProject = (projectId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour rejoindre un projet')
      return
    }
    
    const project = projects.find(p => p.id === projectId)
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
    
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedMembersList = [...(project.membersList || []), newMember]
        return { 
          ...project, 
          members: updatedMembersList.length,
          membersList: updatedMembersList
        }
      }
      return project
    })
    
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    alert('Vous avez rejoint le projet avec succès!')
  }

  const handleViewMembers = (project) => {
    setSelectedProject(project)
    setShowParticipantsModal(true)
  }

  return (
    <div className="projects-page">
      <PageHeader
        title="Projets Collaboratifs"
        subtitle="Travaillez ensemble sur des projets concrets et développez vos compétences en équipe"
        imageUrls={[
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'
        ]}
      />
      <div className="container">
        {isAdmin && (
          <div className="page-actions">
            <Link to="/projects/create" className="btn btn-primary">
              + Créer un projet
            </Link>
          </div>
        )}


        <div className="projects-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'recruiting' ? 'active' : ''}`}
            onClick={() => setFilter('recruiting')}
          >
            Recrutement
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            En cours
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Terminés
          </button>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card card">
              <div className="project-header">
                <div className="project-status">
                  <span className={`status-badge status-${project.status}`}>
                    {project.status === 'recruiting' && '🔍 Recrutement'}
                    {project.status === 'active' && '🚀 En cours'}
                    {project.status === 'completed' && '✅ Terminé'}
                  </span>
                </div>
                <div className="project-owner">
                  {project.owner.avatar ? (
                    <img src={project.owner.avatar} alt={project.owner.name} />
                  ) : (
                    <span>{project.owner.name.charAt(0)}</span>
                  )}
                  <span>{project.owner.name}</span>
                </div>
              </div>
              
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              
              <div className="project-skills">
                {project.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
              
              <div className="project-footer">
                <button
                  className="project-members-link"
                  onClick={() => handleViewMembers(project)}
                  disabled={!project.members || project.members === 0}
                  title="Voir la liste des membres"
                >
                  👥 {project.members || 0}/{project.maxMembers} membres
                </button>
                {project.status === 'recruiting' && project.members < project.maxMembers && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoinProject(project.id)}
                  >
                    Rejoindre
                  </button>
                )}
                {(project.status === 'active' || project.status === 'completed' || (project.status === 'recruiting' && project.members >= project.maxMembers)) && (
                  <Link to={`/projects/${project.id}`} className="btn btn-outline btn-sm">
                    {project.status === 'completed' ? 'Voir les résultats' : 'Voir détails'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <p>Aucun projet pour le moment.</p>
            {isAdmin && (
              <Link to="/projects/create" className="btn btn-primary">
                Créer le premier projet
              </Link>
            )}
            {!isAdmin && isAuthenticated && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-md)' }}>
                ℹ️ Seuls les administrateurs peuvent créer des projets.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal des participants */}
      {showParticipantsModal && selectedProject && (
        <ParticipantsModal
          challenge={selectedProject}
          onClose={() => {
            setShowParticipantsModal(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}

export default Projects

