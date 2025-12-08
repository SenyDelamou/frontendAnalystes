import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ParticipantsModal.css'

const ParticipantsModal = ({ challenge, onClose }) => {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    // Charger la liste des participants depuis le challenge ou projet
    if (challenge) {
      // Support pour challenges (participantsList) et projets (membersList)
      const participantsList = challenge.participantsList || challenge.membersList || []
      setParticipants(participantsList)
    } else {
      setParticipants([])
    }
  }, [challenge])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="participants-modal-overlay" onClick={onClose}>
      <div className="participants-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="participants-modal-header">
          <div>
            <h2>
              {challenge?.membersList ? '👥 Membres du projet' : '👥 Participants du défi'}
            </h2>
            <p className="challenge-title">{challenge?.title}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="participants-modal-body">
          {participants.length > 0 ? (
            <>
              <div className="participants-count">
                <strong>{participants.length}</strong> participant{participants.length > 1 ? 's' : ''}
              </div>
              
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={participant.id || index} className="participant-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="participant-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="participant-avatar">
                      {participant.avatar ? (
                        <img src={participant.avatar} alt={participant.name} />
                      ) : (
                        <span>{participant.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-joined">
                        Rejoint le {formatDate(participant.joinedAt)}
                      </div>
                    </div>
                    <button
                      className="participant-profile-link"
                      onClick={() => {
                        onClose()
                        // Petite délai pour permettre à la modal de se fermer avant la navigation
                        setTimeout(() => {
                          navigate(`/profiles/${participant.userId}`)
                        }, 100)
                      }}
                    >
                      Voir le profil
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-participants">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Aucun participant pour le moment</p>
              <p className="no-participants-hint">Soyez le premier à participer à ce défi!</p>
            </div>
          )}
        </div>

        <div className="participants-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParticipantsModal

