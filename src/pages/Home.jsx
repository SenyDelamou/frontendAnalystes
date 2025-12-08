import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Chat from '../components/Chat'
import './Home.css'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [testimonials, setTestimonials] = useState([])
  const [showTestimonialModal, setShowTestimonialModal] = useState(false)
  const [expandedTestimonial, setExpandedTestimonial] = useState(null)
  const [commentForms, setCommentForms] = useState({})
  const [testimonialForm, setTestimonialForm] = useState({
    content: '',
    rating: 5
  })

  const stats = [
    { number: '150+', label: 'Data Analysts' },
    { number: '45', label: 'Projets actifs' },
    { number: '120', label: 'Ressources partagées' },
    { number: '28', label: 'Défis lancés' }
  ]

  const features = [
    {
      icon: '🤝',
      title: 'Rencontrez vos pairs',
      description: 'Connectez-vous avec d\'autres data analysts de Guinée et élargissez votre réseau professionnel.'
    },
    {
      icon: '💼',
      title: 'Travaillez sur des projets',
      description: 'Collaborez sur des projets concrets et développez vos compétences en équipe.'
    },
    {
      icon: '🎓',
      title: 'Coaching des débutants',
      description: 'Bénéficiez de l\'expérience des experts ou partagez vos connaissances avec les nouveaux.'
    },
    {
      icon: '📚',
      title: 'Partagez des ressources',
      description: 'Accédez et partagez des datasets, tutoriels, outils et bonnes pratiques.'
    },
    {
      icon: '🏆',
      title: 'Lancez des défis',
      description: 'Participez à des défis data pour améliorer vos compétences et gagner en visibilité.'
    },
    {
      icon: '💬',
      title: 'Forum communautaire',
      description: 'Échangez, posez des questions et partagez vos expériences avec la communauté.'
    }
  ]

  useEffect(() => {
    // Load testimonials from localStorage
    const stored = JSON.parse(localStorage.getItem('testimonials') || '[]')
    if (stored.length === 0) {
      // Sample testimonials
      const sampleTestimonials = [
        {
          id: 1,
          content: 'Cette plateforme m\'a permis de rencontrer des data analysts talentueux et de collaborer sur des projets passionnants. Une vraie communauté !',
          author: { id: 1, name: 'Mamadou Diallo', avatar: null },
          rating: 5,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          content: 'Les ressources partagées sont de qualité et m\'ont beaucoup aidé dans mon apprentissage. Je recommande vivement cette plateforme.',
          author: { id: 2, name: 'Aissatou Bah', avatar: null },
          rating: 5,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          content: 'En tant que débutant, j\'ai trouvé un excellent mentor grâce à cette communauté. L\'entraide est vraiment au rendez-vous.',
          author: { id: 3, name: 'Ibrahima Camara', avatar: null },
          rating: 5,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        }
      ]
      setTestimonials(sampleTestimonials)
      localStorage.setItem('testimonials', JSON.stringify(sampleTestimonials))
    } else {
      setTestimonials(stored)
    }

    // Listen for new testimonials
    const handleTestimonialsUpdate = (e) => {
      if (e.detail) {
        setTestimonials(e.detail)
      } else {
        const stored = JSON.parse(localStorage.getItem('testimonials') || '[]')
        setTestimonials(stored)
      }
    }

    window.addEventListener('testimonialsUpdated', handleTestimonialsUpdate)
    return () => {
      window.removeEventListener('testimonialsUpdated', handleTestimonialsUpdate)
    }
  }, [])

  // Auto-scroll testimonials
  useEffect(() => {
    if (testimonials.length === 0) return

    const scrollContainer = document.querySelector('.testimonials-scroll')
    if (!scrollContainer) return

    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame
    let animationFrameId
    let isPaused = false
    let userScrolling = false
    let lastScrollLeft = scrollContainer.scrollLeft

    const autoScroll = () => {
      if (!isPaused && !userScrolling) {
        scrollPosition += scrollSpeed
        
        // Reset to start when reaching the end
        if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollPosition = 0
        }
        
        scrollContainer.scrollLeft = scrollPosition
      }
      animationFrameId = requestAnimationFrame(autoScroll)
    }

    // Detect user scrolling
    const handleScroll = () => {
      const currentScroll = scrollContainer.scrollLeft
      if (Math.abs(currentScroll - lastScrollLeft) > 5) {
        userScrolling = true
        scrollPosition = currentScroll
        clearTimeout(window.scrollTimeout)
        window.scrollTimeout = setTimeout(() => {
          userScrolling = false
        }, 2000) // Resume auto-scroll after 2 seconds of no user interaction
      }
      lastScrollLeft = currentScroll
    }

    // Pause on hover over container
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }

    // Pause on hover over testimonial cards
    const handleCardMouseEnter = () => {
      isPaused = true
    }
    const handleCardMouseLeave = () => {
      isPaused = false
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    // Add event listeners to testimonial cards
    const testimonialCards = scrollContainer.querySelectorAll('.testimonial-card')
    testimonialCards.forEach(card => {
      card.addEventListener('mouseenter', handleCardMouseEnter)
      card.addEventListener('mouseleave', handleCardMouseLeave)
    })

    // Start auto-scroll
    animationFrameId = requestAnimationFrame(autoScroll)

    return () => {
      cancelAnimationFrame(animationFrameId)
      scrollContainer.removeEventListener('scroll', handleScroll)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      testimonialCards.forEach(card => {
        card.removeEventListener('mouseenter', handleCardMouseEnter)
        card.removeEventListener('mouseleave', handleCardMouseLeave)
      })
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout)
      }
    }
  }, [testimonials])

  const handleCreateTestimonial = (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour laisser un témoignage')
      return
    }

    const newTestimonial = {
      id: Date.now(),
      content: testimonialForm.content,
      author: { id: user.id, name: user.name, avatar: user.avatar },
      rating: testimonialForm.rating,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    }

    const updatedTestimonials = [newTestimonial, ...testimonials]
    setTestimonials(updatedTestimonials)
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('testimonialsUpdated', { detail: updatedTestimonials }))
    
    // Reset form and close modal
    setTestimonialForm({
      content: '',
      rating: 5
    })
    setShowTestimonialModal(false)
    alert('Merci pour votre témoignage !')
  }

  const handleLikeTestimonial = (testimonialId) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour liker un témoignage')
      return
    }

    const updatedTestimonials = testimonials.map(testimonial => {
      if (testimonial.id === testimonialId) {
        const likes = testimonial.likes || []
        const userLiked = likes.includes(user.id)
        
        return {
          ...testimonial,
          likes: userLiked 
            ? likes.filter(id => id !== user.id)
            : [...likes, user.id]
        }
      }
      return testimonial
    })

    setTestimonials(updatedTestimonials)
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
    window.dispatchEvent(new CustomEvent('testimonialsUpdated', { detail: updatedTestimonials }))
  }

  const handleAddComment = (testimonialId, commentText) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour commenter')
      return
    }

    if (!commentText.trim()) {
      return
    }

    const newComment = {
      id: Date.now(),
      content: commentText,
      author: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString()
    }

    const updatedTestimonials = testimonials.map(testimonial => {
      if (testimonial.id === testimonialId) {
        return {
          ...testimonial,
          comments: [...(testimonial.comments || []), newComment]
        }
      }
      return testimonial
    })

    setTestimonials(updatedTestimonials)
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials))
    window.dispatchEvent(new CustomEvent('testimonialsUpdated', { detail: updatedTestimonials }))
    
    // Clear comment form
    setCommentForms({ ...commentForms, [testimonialId]: '' })
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <h1>Communauté des Data Analysts<br />de Guinée</h1>
            <p className="hero-description">
              La plateforme où les data analysts guinéens se rencontrent, collaborent sur des projets,
              partagent des ressources, coachent les débutants et relèvent des défis ensemble.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/articles" className="btn btn-primary">
                    Explorer les ressources
                  </Link>
                  <Link to="/challenges" className="btn btn-outline">
                    Voir les défis
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary">
                    Rejoindre la communauté
                  </Link>
                  <Link to="/articles" className="btn btn-outline">
                    Explorer les ressources
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid animate-stagger">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card hover-lift">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi rejoindre notre communauté ?</h2>
            <p>Une plateforme dédiée aux data analysts de Guinée pour collaborer, apprendre et grandir ensemble</p>
          </div>
          <div className="features-grid animate-stagger">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card hover-lift" style={{ '--delay': index }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Ce que disent nos membres</h2>
            <p>Découvrez les témoignages de la communauté des data analysts de Guinée</p>
          </div>
          <div className="testimonials-container">
            <div className="testimonials-scroll">
              <div className="testimonials-grid">
                {/* Duplicate testimonials for seamless loop */}
                {[...testimonials, ...testimonials].map((testimonial, index) => {
                  const likes = testimonial.likes || []
                  const comments = testimonial.comments || []
                  const isLiked = isAuthenticated && likes.includes(user?.id)
                  const isExpanded = expandedTestimonial === testimonial.id
                  
                  return (
                    <div key={`${testimonial.id}-${index}`} className="testimonial-card card animate-fade-in">
                      <div className="testimonial-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < testimonial.rating ? 'star filled' : 'star'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <p className="testimonial-content">"{testimonial.content}"</p>
                      <div className="testimonial-author">
                        <div className="testimonial-avatar">
                          {testimonial.author.avatar ? (
                            <img src={testimonial.author.avatar} alt={testimonial.author.name} />
                          ) : (
                            <span>{testimonial.author.name?.charAt(0).toUpperCase() || 'U'}</span>
                          )}
                        </div>
                        <div className="testimonial-info">
                          <div className="testimonial-name">{testimonial.author.name}</div>
                          <div className="testimonial-date">
                            {new Date(testimonial.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="testimonial-actions">
                        <button
                          className={`testimonial-like-btn ${isLiked ? 'liked' : ''}`}
                          onClick={() => handleLikeTestimonial(testimonial.id)}
                          disabled={!isAuthenticated}
                          title={isAuthenticated ? (isLiked ? 'Retirer le like' : 'Liker') : 'Connectez-vous pour liker'}
                        >
                          <span className="like-icon">{isLiked ? '❤️' : '🤍'}</span>
                          <span className="like-count">{likes.length}</span>
                        </button>
                        <button
                          className="testimonial-comment-btn"
                          onClick={() => setExpandedTestimonial(isExpanded ? null : testimonial.id)}
                          title="Voir les commentaires"
                        >
                          <span>💬</span>
                          <span>{comments.length}</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {isExpanded && (
                        <div className="testimonial-comments">
                          <div className="comments-list">
                            {comments.length > 0 ? (
                              comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                  <div className="comment-author">
                                    <div className="comment-avatar">
                                      {comment.author.avatar ? (
                                        <img src={comment.author.avatar} alt={comment.author.name} />
                                      ) : (
                                        <span>{comment.author.name?.charAt(0).toUpperCase() || 'U'}</span>
                                      )}
                                    </div>
                                    <div className="comment-info">
                                      <div className="comment-name">{comment.author.name}</div>
                                      <div className="comment-date">
                                        {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="comment-content">{comment.content}</p>
                                </div>
                              ))
                            ) : (
                              <p className="no-comments">Aucun commentaire pour le moment</p>
                            )}
                          </div>
                          
                          {isAuthenticated && (
                            <div className="comment-form">
                              <textarea
                                placeholder="Ajouter un commentaire..."
                                value={commentForms[testimonial.id] || ''}
                                onChange={(e) => setCommentForms({ ...commentForms, [testimonial.id]: e.target.value })}
                                rows="2"
                                maxLength={300}
                              />
                              <div className="comment-form-actions">
                                <span className="char-count">{(commentForms[testimonial.id] || '').length}/300</span>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleAddComment(testimonial.id, commentForms[testimonial.id] || '')}
                                  disabled={!commentForms[testimonial.id]?.trim()}
                                >
                                  Commenter
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <div className="testimonials-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowTestimonialModal(true)}
              >
                ✍️ Laisser un témoignage
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à rejoindre la communauté ?</h2>
            <p>Connectez-vous avec les data analysts de Guinée et développez vos compétences ensemble</p>
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-primary btn-large">
                Créer un compte gratuit
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="testimonial-modal-overlay" onClick={() => setShowTestimonialModal(false)}>
          <div className="testimonial-modal" onClick={(e) => e.stopPropagation()}>
            <div className="testimonial-modal-header">
              <h3>Laisser un témoignage</h3>
              <button className="testimonial-modal-close" onClick={() => setShowTestimonialModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTestimonial} className="testimonial-modal-form">
              <div className="form-group">
                <label>Votre témoignage *</label>
                <textarea
                  value={testimonialForm.content}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  required
                  rows="6"
                  placeholder="Partagez votre expérience avec la communauté..."
                  maxLength={500}
                />
                <div className="char-count">{testimonialForm.content.length}/500</div>
              </div>
              <div className="form-group">
                <label>Note (sur 5 étoiles) *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`rating-star ${testimonialForm.rating >= rating ? 'active' : ''}`}
                      onClick={() => setTestimonialForm({ ...testimonialForm, rating })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-value">{testimonialForm.rating}/5</span>
                </div>
              </div>
              <div className="testimonial-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowTestimonialModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Publier le témoignage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <Chat />
    </div>
  )
}

export default Home

