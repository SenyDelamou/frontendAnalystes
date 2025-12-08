import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './TopicDetail.css'

const TopicDetail = () => {
  const { id } = useParams()
  const { isAuthenticated, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const found = topics.find(t => t.id === parseInt(id))
    
    if (found) {
      setTopic(found)
      setReplies(found.replies || [])
      
      // Increment views
      found.views = (found.views || 0) + 1
      const updated = topics.map(t => t.id === parseInt(id) ? found : t)
      localStorage.setItem('topics', JSON.stringify(updated))
    }
    setLoading(false)
  }, [id])

  const handleReply = (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour répondre')
      navigate('/login')
      return
    }

    if (!replyContent.trim()) {
      alert('Veuillez saisir une réponse')
      return
    }

    const newReply = {
      id: Date.now(),
      content: replyContent,
      author: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      likes: 0
    }

    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const found = topics.find(t => t.id === parseInt(id))
    
    if (found) {
      found.replies = found.replies || []
      found.replies = [...found.replies, newReply]
      found.repliesCount = (found.repliesCount || 0) + 1
      found.lastActivity = new Date().toISOString()
      
      const updated = topics.map(t => t.id === parseInt(id) ? found : t)
      localStorage.setItem('topics', JSON.stringify(updated))
      
      setTopic(found)
      setReplies(found.replies)
      setReplyContent('')
      
      // Dispatch event to update forum list
      window.dispatchEvent(new CustomEvent('topicsUpdated'))
    }
  }

  const handleLikeReply = (replyId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour aimer une réponse')
      return
    }

    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const found = topics.find(t => t.id === parseInt(id))
    
    if (found && found.replies) {
      found.replies = found.replies.map(r => 
        r.id === replyId ? { ...r, likes: (r.likes || 0) + 1 } : r
      )
      
      const updated = topics.map(t => t.id === parseInt(id) ? found : t)
      localStorage.setItem('topics', JSON.stringify(updated))
      
      setTopic(found)
      setReplies(found.replies)
    }
  }

  const handleMarkSolved = () => {
    if (!isAuthenticated || !user || topic.author.id !== user.id) {
      return
    }

    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const found = topics.find(t => t.id === parseInt(id))
    
    if (found) {
      found.isSolved = !found.isSolved
      const updated = topics.map(t => t.id === parseInt(id) ? found : t)
      localStorage.setItem('topics', JSON.stringify(updated))
      setTopic(found)
    }
  }

  const handleDeleteTopic = () => {
    if (!isAuthenticated || !isAdmin) {
      return
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sujet ? Cette action est irréversible.')) {
      return
    }

    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    const updated = topics.filter(t => t.id !== parseInt(id))
    localStorage.setItem('topics', JSON.stringify(updated))
    
    // Dispatch event to update forum list
    window.dispatchEvent(new CustomEvent('topicsUpdated'))
    
    // Navigate back to forum
    navigate('/forum')
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return 'Il y a quelques secondes'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
    return past.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="topic-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement de la discussion...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="topic-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Discussion non trouvée</h2>
            <p>Cette discussion n'existe pas ou a été supprimée.</p>
            <Link to="/forum" className="btn btn-primary">
              Retour au forum
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isAuthor = isAuthenticated && user && topic.author.id === user.id

  return (
    <div className="topic-detail-page">
      <div className="container">
        <Link to="/forum" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour au forum
        </Link>

        <div className="topic-detail">
          <div className="topic-header-detail">
            <div className="topic-meta">
              <span className={`topic-category category-${topic.category.toLowerCase().replace('é', 'e')}`}>
                {topic.category}
              </span>
              {topic.isSolved && (
                <span className="topic-solved-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Résolu
                </span>
              )}
            </div>
            <div className="topic-stats-detail">
              <span>💬 {topic.replies || 0} réponses</span>
              <span>👁️ {topic.views || 0} vues</span>
              {topic.likes > 0 && <span>❤️ {topic.likes} likes</span>}
            </div>
          </div>

          <h1>{topic.title}</h1>

          <div className="topic-content">
            <div className="topic-author-card">
              <div className="author-avatar">
                {topic.author.avatar ? (
                  <img src={topic.author.avatar} alt={topic.author.name} />
                ) : (
                  <span>{topic.author.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="author-info">
                <div className="author-name">{topic.author.name}</div>
                <div className="topic-date">{getTimeAgo(topic.createdAt)}</div>
              </div>
            </div>
            <div className="topic-text">
              <p>{topic.content}</p>
              {topic.tags && topic.tags.length > 0 && (
                <div className="topic-tags">
                  {topic.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(isAuthor || (isAuthenticated && user?.role === 'admin')) && (
            <div className="topic-actions">
              {isAuthor && (
                <button 
                  onClick={handleMarkSolved}
                  className={`btn ${topic.isSolved ? 'btn-success' : 'btn-secondary'}`}
                >
                  {topic.isSolved ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Marquer comme non résolu
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Marquer comme résolu
                    </>
                  )}
                </button>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <button 
                  onClick={handleDeleteTopic}
                  className="btn btn-danger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Supprimer le sujet
                </button>
              )}
            </div>
          )}

          <div className="replies-section">
            <h2>
              Réponses
              {replies.length > 0 && <span className="replies-count">({replies.length})</span>}
            </h2>

            {replies.length === 0 ? (
              <div className="no-replies">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Aucune réponse pour le moment. Soyez le premier à répondre !</p>
              </div>
            ) : (
              <div className="replies-list">
                {replies.map((reply) => (
                  <div key={reply.id} className="reply-card">
                    <div className="reply-author">
                      <div className="author-avatar-small">
                        {reply.author.avatar ? (
                          <img src={reply.author.avatar} alt={reply.author.name} />
                        ) : (
                          <span>{reply.author.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="author-info-small">
                        <div className="author-name">{reply.author.name}</div>
                        <div className="reply-date">{getTimeAgo(reply.createdAt)}</div>
                      </div>
                    </div>
                    <div className="reply-content">
                      <p>{reply.content}</p>
                    </div>
                    <div className="reply-actions">
                      <button 
                        onClick={() => handleLikeReply(reply.id)}
                        className="like-reply-btn"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {reply.likes || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleReply} className="reply-form">
                <h3>Ajouter une réponse</h3>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Partagez votre réponse, conseil ou expérience..."
                  rows="6"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Publier la réponse
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>Vous devez être connecté pour répondre à cette discussion.</p>
                <Link to="/login" className="btn btn-primary">
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicDetail
