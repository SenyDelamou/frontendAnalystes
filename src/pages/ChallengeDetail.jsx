import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ChallengeDetail.css'

const ChallengeDetail = () => {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChallenge = () => {
      setLoading(true)
      
      const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
      const found = challenges.find(c => c.id === parseInt(id))
      
      if (found) {
        setChallenge(found)
        
        // Si le challenge est terminé, utiliser les participants réels ou générer des résultats simulés
        if (found.status === 'completed') {
          // Si le challenge a une liste de participants, les utiliser
          if (found.participantsList && found.participantsList.length > 0) {
            // Convertir les participants en résultats avec scores
            const participantsResults = found.participantsList.map((participant, index) => {
              // Score simulé basé sur la position (les premiers participants ont de meilleurs scores)
              const baseScore = 100 - (index * 5) + Math.floor(Math.random() * 10)
              const score = Math.max(60, baseScore)
              
              return {
                id: participant.id || index + 1,
                rank: index + 1,
                participantName: participant.name,
                userId: participant.userId || `user_${participant.id || index + 1}`,
                score: score,
                submissionDate: participant.joinedAt || new Date().toISOString(),
                prize: index === 0 ? found.prize : null,
                avatar: participant.avatar || null
              }
            })
            
            // Trier par score décroissant
            const sortedResults = participantsResults.sort((a, b) => b.score - a.score)
            setResults(sortedResults.map((r, index) => ({ ...r, rank: index + 1 })))
          } else {
            // Générer des résultats simulés si pas de participants
            const mockResults = generateMockResults(found)
            setResults(mockResults)
          }
        }
        
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [id])

  // Générer des résultats simulés pour les challenges terminés
  const generateMockResults = (challenge) => {
    const participantCount = challenge.participants || 0
    
    if (participantCount === 0) {
      return []
    }

    const mockNames = [
      'Mamadou Diallo', 'Aissatou Bah', 'Ibrahima Camara', 'Fatoumata Diallo',
      'Ousmane Barry', 'Mariam Sow', 'Amadou Diallo', 'Aminata Keita',
      'Sékou Touré', 'Kadiatou Diallo', 'Mohamed Bah', 'Hawa Camara'
    ]

    const results = []
    const usedNames = new Set()
    
    // Générer entre 3 et participantCount résultats
    const resultCount = Math.min(Math.max(3, Math.floor(participantCount * 0.6)), participantCount)
    
    for (let i = 0; i < resultCount; i++) {
      let name
      do {
        name = mockNames[Math.floor(Math.random() * mockNames.length)]
      } while (usedNames.has(name))
      usedNames.add(name)

      // Score simulé (plus élevé pour les premières places)
      const baseScore = 100 - (i * 8) + Math.floor(Math.random() * 10)
      const score = Math.max(60, baseScore)

      results.push({
        id: i + 1,
        rank: i + 1,
        participantName: name,
        userId: `user_${i + 1}_${Date.now()}`, // ID unique pour chaque participant
        score: score,
        submissionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        prize: i === 0 ? challenge.prize : null, // Seul le premier gagne le prix
        avatar: null
      })
    }

    return results.sort((a, b) => b.score - a.score).map((r, index) => ({
      ...r,
      rank: index + 1
    }))
  }

  const getStatusBadge = (status) => {
    const badges = {
      'active': { text: '🚀 Actif', class: 'status-active' },
      'upcoming': { text: '📅 À venir', class: 'status-upcoming' },
      'completed': { text: '✅ Terminé', class: 'status-completed' }
    }
    return badges[status] || badges['active']
  }

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      'Débutant': 'difficulty-beginner',
      'Intermédiaire': 'difficulty-intermediate',
      'Avancé': 'difficulty-advanced'
    }
    return badges[difficulty] || 'difficulty-intermediate'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="challenge-detail-page">
        <div className="container">
          <div className="challenge-detail card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Chargement du défi...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="challenge-detail-page">
        <div className="container">
          <div className="challenge-detail card">
            <p>Défi non trouvé</p>
            <Link to="/challenges" className="btn btn-primary">Retour aux défis</Link>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(challenge.status)
  const difficultyClass = getDifficultyBadge(challenge.difficulty)

  return (
    <div className="challenge-detail-page">
      <div className="container">
        <Link to="/challenges" className="back-link">← Retour aux défis</Link>
        
        <div className="challenge-detail card">
          <div className="challenge-detail-header">
            <div className="challenge-status-badges">
              <span className={`status-badge ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
              <span className={`difficulty-badge ${difficultyClass}`}>
                {challenge.difficulty}
              </span>
            </div>
            <h1>{challenge.title}</h1>
          </div>

          <div className="challenge-detail-meta">
            <div className="challenge-organizer-info">
              <div className="organizer-avatar">
                {challenge.organizer?.avatar ? (
                  <img src={challenge.organizer.avatar} alt={challenge.organizer.name} />
                ) : (
                  <span>{challenge.organizer?.name?.charAt(0) || 'O'}</span>
                )}
              </div>
              <div>
                <div className="organizer-label">Organisé par</div>
                <div className="organizer-name">{challenge.organizer?.name || 'Organisateur'}</div>
              </div>
            </div>
            <div className="challenge-stats">
              <div className="stat-item">
                <span className="stat-label">👥 Participants</span>
                <span className="stat-value">{challenge.participants || 0}</span>
              </div>
              {challenge.prize && (
                <div className="stat-item">
                  <span className="stat-label">💰 Prix</span>
                  <span className="stat-value">{challenge.prize}</span>
                </div>
              )}
              {challenge.deadline && (
                <div className="stat-item">
                  <span className="stat-label">📅 Date limite</span>
                  <span className="stat-value">{formatDate(challenge.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="challenge-description">
            <h2>Description du défi</h2>
            <p>{challenge.description}</p>
          </div>

          {challenge.skills && challenge.skills.length > 0 && (
            <div className="challenge-skills-section">
              <h3>Compétences requises</h3>
              <div className="skills-list">
                {challenge.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Section Résultats pour les challenges terminés */}
          {challenge.status === 'completed' && (
            <div className="challenge-results-section">
              <h2>🏆 Résultats du défi</h2>
              
              {results.length > 0 ? (
                <>
                  <div className="results-summary">
                    <p>
                      <strong>{results.length}</strong> participant{results.length > 1 ? 's' : ''} ont soumis une solution.
                      {challenge.prize && ` Le prix de ${challenge.prize} a été attribué au gagnant.`}
                    </p>
                  </div>

                  <div className="results-leaderboard">
                    <div className="leaderboard-header">
                      <span className="rank-header">Rang</span>
                      <span className="participant-header">Participant</span>
                      <span className="score-header">Score</span>
                      <span className="prize-header">Prix</span>
                    </div>
                    
                    {results.map((result) => (
                      <Link
                        key={result.id}
                        to={`/profiles/${result.userId}`}
                        className={`leaderboard-item ${result.rank === 1 ? 'winner' : ''} clickable`}
                      >
                        <div className="rank-badge">
                          {result.rank === 1 && '🥇'}
                          {result.rank === 2 && '🥈'}
                          {result.rank === 3 && '🥉'}
                          {result.rank > 3 && `#${result.rank}`}
                        </div>
                        <div className="participant-info">
                          <div className="participant-avatar">
                            {result.avatar ? (
                              <img src={result.avatar} alt={result.participantName} />
                            ) : (
                              <span>{result.participantName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="participant-details">
                            <div className="participant-name">{result.participantName}</div>
                            <div className="submission-date">
                              Soumis le {formatDate(result.submissionDate)}
                            </div>
                          </div>
                        </div>
                        <div className="score-value">
                          <span className="score-number">{result.score}</span>
                          <span className="score-label">/ 100</span>
                        </div>
                        <div className="prize-value">
                          {result.prize ? (
                            <span className="prize-badge">💰 {result.prize}</span>
                          ) : (
                            <span className="no-prize">-</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <p>Aucun résultat disponible pour ce défi.</p>
                </div>
              )}
            </div>
          )}

          {/* Section pour les challenges actifs ou à venir */}
          {(challenge.status === 'active' || challenge.status === 'upcoming') && (
            <div className="challenge-actions">
              {challenge.status === 'active' && (
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert('Vous devez être connecté pour participer à un défi')
                      navigate('/login')
                      return
                    }
                    // Logique de participation
                    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
                    const updated = challenges.map(c => {
                      if (c.id === challenge.id) {
                        return { ...c, participants: (c.participants || 0) + 1 }
                      }
                      return c
                    })
                    localStorage.setItem('challenges', JSON.stringify(updated))
                    alert('Vous avez rejoint le défi avec succès!')
                    setChallenge({ ...challenge, participants: (challenge.participants || 0) + 1 })
                  }}
                >
                  🚀 Participer au défi
                </button>
              )}
              {challenge.status === 'upcoming' && (
                <div className="upcoming-notice">
                  <p>⏰ Ce défi débutera bientôt. Restez connecté pour être notifié!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChallengeDetail

