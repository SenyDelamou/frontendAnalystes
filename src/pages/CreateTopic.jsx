import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './CreateArticle.css'

const CreateTopic = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isSpecialGuest: false,
    guests: []
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addGuest = () => {
    setFormData({
      ...formData,
      guests: [...formData.guests, { name: '', title: '', avatar: '' }]
    })
  }

  const removeGuest = (index) => {
    const updatedGuests = formData.guests.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      guests: updatedGuests,
      isSpecialGuest: updatedGuests.length > 0
    })
  }

  const updateGuest = (index, field, value) => {
    const updatedGuests = [...formData.guests]
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value
    }
    setFormData({
      ...formData,
      guests: updatedGuests
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const validGuests = formData.guests.filter(g => g.name.trim() && g.title.trim())
    
    const topic = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: tagsArray,
      author: { id: user.id, name: user.name, avatar: user.avatar },
      isSpecialGuest: validGuests.length > 0,
      specialGuests: validGuests.length > 0 ? validGuests : null,
      createdAt: new Date().toISOString(),
      replies: 0,
      views: 0,
      likes: 0,
      isSolved: false,
      lastActivity: new Date().toISOString()
    }

    const topics = JSON.parse(localStorage.getItem('topics') || '[]')
    topics.unshift(topic)
    localStorage.setItem('topics', JSON.stringify(topics))

    navigate(`/forum/${topic.id}`)
  }

  if (!isAuthenticated) return null

  return (
    <div className="create-article-page">
      <div className="container">
        <div className="create-article card">
          <h1>Créer un sujet</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Titre de votre sujet"
              />
            </div>
            <div className="form-group">
              <label>Catégorie *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Sélectionnez une catégorie</option>
                <option value="Général">💬 Général</option>
                <option value="Technique">💻 Technique</option>
                <option value="Projets">🚀 Projets</option>
                <option value="Ressources">📚 Ressources</option>
                <option value="Carrière">💼 Carrière</option>
                <option value="Questions">❓ Questions</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contenu *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="10"
                placeholder="Décrivez votre question ou sujet de discussion..."
              />
            </div>
            <div className="form-group">
              <label>Tags (séparés par des virgules)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Ex: python, analyse, débutant"
              />
              <small className="form-hint">Aide les autres à trouver votre discussion</small>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isSpecialGuest"
                  checked={formData.isSpecialGuest || formData.guests.length > 0}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setFormData({ 
                      ...formData, 
                      isSpecialGuest: isChecked,
                      guests: isChecked && formData.guests.length === 0 
                        ? [{ name: '', title: '', avatar: '' }] 
                        : formData.guests
                    })
                  }}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Invités spéciaux / Conférenciers (AMA, conférence, etc.)</span>
              </label>
            </div>

            {(formData.isSpecialGuest || formData.guests.length > 0) && (
              <div className="special-guest-fields">
                <div className="guests-header">
                  <h3>Invitations Spéciales</h3>
                  <button
                    type="button"
                    onClick={addGuest}
                    className="btn-add-guest"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Ajouter un invité
                  </button>
                </div>
                
                {formData.guests.map((guest, index) => (
                  <div key={index} className="guest-item">
                    <div className="guest-item-header">
                      <span className="guest-number">Invité {index + 1}</span>
                      {formData.guests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="btn-remove-guest"
                          title="Supprimer cet invité"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="guest-fields-grid">
                      <div className="form-group">
                        <label>Nom de l'invité *</label>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => updateGuest(index, 'name', e.target.value)}
                          required={formData.isSpecialGuest || formData.guests.length > 0}
                          placeholder="Ex: Dr. Mamadou Diallo"
                        />
                      </div>
                      <div className="form-group">
                        <label>Titre / Fonction *</label>
                        <input
                          type="text"
                          value={guest.title}
                          onChange={(e) => updateGuest(index, 'title', e.target.value)}
                          required={formData.isSpecialGuest || formData.guests.length > 0}
                          placeholder="Ex: Data Scientist Senior chez Google"
                        />
                      </div>
                      <div className="form-group">
                        <label>URL de l'avatar (optionnel)</label>
                        <input
                          type="url"
                          value={guest.avatar}
                          onChange={(e) => updateGuest(index, 'avatar', e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/forum')}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Créer le sujet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTopic

