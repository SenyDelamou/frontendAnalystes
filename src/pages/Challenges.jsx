import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import ParticipantsModal from '../components/ParticipantsModal'
import Toast from '../components/Toast'
import './Challenges.css'

const Challenges = () => {
  const { isAuthenticated, user, isAdmin } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [filter, setFilter] = useState('all') // all, active, upcoming, completed
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Load challenges from localStorage
    let stored = JSON.parse(localStorage.getItem('challenges') || '[]')
    
    // Migrer les challenges existants pour ajouter participantsList s'il n'existe pas
    stored = stored.map(challenge => {
      if (!challenge.participantsList && challenge.participants > 0) {
        // Générer une liste de participants simulés pour les challenges existants
        const mockNames = [
          'Mamadou Diallo', 'Aissatou Bah', 'Ibrahima Camara', 'Fatoumata Diallo',
          'Ousmane Barry', 'Mariam Sow', 'Amadou Diallo', 'Aminata Keita',
          'Sékou Touré', 'Kadiatou Diallo', 'Mohamed Bah', 'Hawa Camara'
        ]
        const participantsList = []
        for (let i = 0; i < challenge.participants; i++) {
          // Utiliser des IDs numériques cohérents (1, 2, 3, etc.)
          const userId = i + 1
          participantsList.push({
            id: i + 1,
            userId: userId,
            name: mockNames[i % mockNames.length],
            avatar: null,
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
        return { ...challenge, participantsList }
      }
      if (!challenge.participantsList) {
        return { ...challenge, participantsList: [] }
      }
      return challenge
    })
    
    // Always use stored data if available, otherwise use samples
    if (stored.length > 0) {
      setChallenges(stored)
      // Sauvegarder les challenges migrés
      localStorage.setItem('challenges', JSON.stringify(stored))
    } else if (stored.length === 0) {
      // Sample challenges
      const sampleChallenges = [
        {
          id: 1,
          title: 'Défi : Analyse des données de transport',
          description: 'Analysez les données de transport public de Conakry et proposez des solutions pour optimiser les trajets.',
          organizer: { id: 1, name: 'Ministère des Transports', avatar: null },
          status: 'active',
          difficulty: 'Intermédiaire',
          prize: '500 000 GNF',
          participants: 23,
          participantsList: generateMockParticipants(23),
          deadline: '2024-02-15',
          skills: ['Python', 'Pandas', 'Visualisation'],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Défi : Prédiction de la demande agricole',
          description: 'Créez un modèle de prédiction pour la demande de produits agricoles en Guinée.',
          organizer: { id: 2, name: 'Agence de Développement', avatar: null },
          status: 'active',
          difficulty: 'Avancé',
          prize: '1 000 000 GNF',
          participants: 15,
          participantsList: generateMockParticipants(15),
          deadline: '2024-02-20',
          skills: ['Machine Learning', 'Python', 'Scikit-learn'],
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Défi : Dashboard de santé publique',
          description: 'Concevez un dashboard interactif pour visualiser les données de santé publique.',
          organizer: { id: 3, name: 'Ministère de la Santé', avatar: null },
          status: 'upcoming',
          difficulty: 'Débutant',
          prize: '300 000 GNF',
          participants: 0,
          participantsList: [],
          deadline: '2024-03-01',
          skills: ['Tableau', 'Power BI', 'Visualisation'],
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Défi : Analyse de sentiment sur les réseaux sociaux',
          description: 'Analysez les sentiments exprimés sur les réseaux sociaux concernant des sujets d\'actualité en Guinée.',
          organizer: { id: 4, name: 'Startup Tech', avatar: null },
          status: 'completed',
          difficulty: 'Intermédiaire',
          prize: '750 000 GNF',
          participants: 18,
          participantsList: generateMockParticipants(18),
          deadline: '2024-01-30',
          skills: ['NLP', 'Python', 'Text Analysis'],
          createdAt: new Date().toISOString()
        }
      ]
      
      // Helper function to generate mock participants
      function generateMockParticipants(count) {
        const mockNames = [
          'Mamadou Diallo', 'Aissatou Bah', 'Ibrahima Camara', 'Fatoumata Diallo',
          'Ousmane Barry', 'Mariam Sow', 'Amadou Diallo', 'Aminata Keita',
          'Sékou Touré', 'Kadiatou Diallo', 'Mohamed Bah', 'Hawa Camara',
          'Alpha Condé', 'Binta Diallo', 'Moussa Camara', 'Aissatou Barry',
          'Ibrahima Bah', 'Fatou Sow', 'Mamadou Keita', 'Aminata Diallo'
        ]
        const participants = []
        for (let i = 0; i < count; i++) {
          // Utiliser des IDs numériques cohérents (1, 2, 3, etc.)
          const userId = i + 1
          participants.push({
            id: i + 1,
            userId: userId,
            name: mockNames[i % mockNames.length],
            avatar: null,
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
        return participants
      }
      setChallenges(sampleChallenges)
      localStorage.setItem('challenges', JSON.stringify(sampleChallenges))
    }
  }, [])

  // Reload challenges when localStorage changes (for admin-created challenges)
  useEffect(() => {
    const handleChallengesUpdate = (e) => {
      if (e.detail) {
        setChallenges(e.detail)
      } else {
        const stored = JSON.parse(localStorage.getItem('challenges') || '[]')
        if (stored.length > 0) {
          setChallenges(stored)
        }
      }
    }

    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem('challenges') || '[]')
      if (stored.length > 0) {
        setChallenges(stored)
      }
    }

    window.addEventListener('challengesUpdated', handleChallengesUpdate)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('challengesUpdated', handleChallengesUpdate)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true
    return challenge.status === filter
  })

  const handleJoinChallenge = (challengeId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour participer à un défi')
      return
    }
    
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) return
    
    // Vérifier si l'utilisateur participe déjà
    const participantsList = challenge.participantsList || []
    const isAlreadyParticipating = participantsList.some(p => p.userId === user.id)
    
    if (isAlreadyParticipating) {
      alert('Vous participez déjà à ce défi!')
      return
    }
    
    // Ajouter l'utilisateur à la liste des participants
    const newParticipant = {
      id: Date.now(),
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      joinedAt: new Date().toISOString()
    }
    
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedParticipantsList = [...(challenge.participantsList || []), newParticipant]
        return { 
          ...challenge, 
          participants: updatedParticipantsList.length,
          participantsList: updatedParticipantsList
        }
      }
      return challenge
    })
    
    setChallenges(updatedChallenges)
    localStorage.setItem('challenges', JSON.stringify(updatedChallenges))
    alert('Vous avez rejoint le défi avec succès!')
  }

  const handleViewParticipants = (challenge) => {
    setSelectedChallenge(challenge)
    setShowParticipantsModal(true)
  }

  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate - today
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="challenges-page">
      <PageHeader
        title="Défis Data"
        subtitle="Relevez des défis pour améliorer vos compétences et gagner en visibilité"
        imageUrls={[
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80'
        ]}
      />
      <div className="container">
        {isAdmin && (
          <div className="page-actions">
            <Link to="/challenges/create" className="btn btn-primary">
              + Lancer un défi
            </Link>
          </div>
        )}


        <div className="challenges-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            À venir
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Actifs
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Terminés
          </button>
        </div>

        <div className="challenges-grid">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card card">
              <div className="challenge-header">
                <div className="challenge-status">
                  <span className={`status-badge status-${challenge.status}`}>
                    {challenge.status === 'active' && '🚀 Actif'}
                    {challenge.status === 'upcoming' && '📅 À venir'}
                    {challenge.status === 'completed' && '✅ Terminé'}
                  </span>
                  <span className={`difficulty-badge difficulty-${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="challenge-organizer">
                  <span>Organisé par {challenge.organizer.name}</span>
                </div>
              </div>
              
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              
              <div className="challenge-info">
                <div className="info-item">
                  <span className="info-label">💰 Prix :</span>
                  <span className="info-value">{challenge.prize}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">👥 Participants :</span>
                  <button
                    className="participants-link"
                    onClick={() => handleViewParticipants(challenge)}
                    disabled={!challenge.participants || challenge.participants === 0}
                    title="Voir la liste des participants"
                  >
                    {challenge.participants || 0}
                  </button>
                </div>
                {challenge.status !== 'completed' && (
                  <div className="info-item">
                    <span className="info-label">⏰ Temps restant :</span>
                    <span className="info-value">{getDaysRemaining(challenge.deadline)} jours</span>
                  </div>
                )}
              </div>
              
              <div className="challenge-skills">
                {challenge.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
              
              <div className="challenge-footer">
                {(challenge.status === 'active' || challenge.status === 'upcoming') && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Participer
                  </button>
                )}
                {challenge.status === 'completed' && (
                  <Link to={`/challenges/${challenge.id}`} className="btn btn-outline">
                    Voir les résultats
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="empty-state">
            <p>Aucun défi pour le moment.</p>
            {isAdmin && (
              <Link to="/challenges/create" className="btn btn-primary">
                Lancer le premier défi
              </Link>
            )}
            {!isAdmin && isAuthenticated && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'var(--spacing-md)' }}>
                ℹ️ Seuls les administrateurs peuvent lancer des défis.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal des participants */}
      {showParticipantsModal && selectedChallenge && (
        <ParticipantsModal
          challenge={selectedChallenge}
          onClose={() => {
            setShowParticipantsModal(false)
            setSelectedChallenge(null)
          }}
        />
      )}
    </div>
  )
}

export default Challenges

