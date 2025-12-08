import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './CreateArticle.css'

const CreateArticle = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if this is for projects or challenges (admin only)
  const isProjectPage = location.pathname.includes('/projects/create')
  const isChallengePage = location.pathname.includes('/challenges/create')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    downloadLink: '',
    fileSize: '',
    format: '',
    tags: '',
    difficulty: '',
    language: '',
    status: 'recruiting',
    maxMembers: 5,
    skills: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Projects and challenges are admin only
    if ((isProjectPage || isChallengePage) && !isAdmin) {
      alert(isProjectPage 
        ? 'Seuls les administrateurs peuvent créer des projets.'
        : 'Seuls les administrateurs peuvent lancer des défis.')
      navigate(isProjectPage ? '/projects' : '/challenges')
    }
  }, [isAuthenticated, isAdmin, isProjectPage, isChallengePage, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Handle project creation
    if (isProjectPage) {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      
      const newProject = {
        id: Date.now(),
        title: formData.title,
        description: formData.content,
        owner: { id: user.id, name: user.name, avatar: user.avatar },
        status: formData.status || 'recruiting',
        skills: skillsArray,
        members: 1,
        maxMembers: parseInt(formData.maxMembers) || 5,
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

      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      projects.unshift(newProject)
      localStorage.setItem('projects', JSON.stringify(projects))
      
      // Dispatch custom event to notify other pages
      window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: projects }))
      
      navigate(`/projects/${newProject.id}`)
      return
    }
    
    // Handle challenge creation
    if (isChallengePage) {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      
      const newChallenge = {
        id: Date.now(),
        title: formData.title,
        description: formData.content,
        organizer: { id: user.id, name: user.name, avatar: user.avatar },
        status: formData.status || 'active',
        difficulty: formData.difficulty || 'Intermédiaire',
        prize: formData.prize || '',
        deadline: formData.deadline || '',
        skills: skillsArray,
        participants: 0,
        participantsList: [],
        createdAt: new Date().toISOString()
      }

      const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
      challenges.unshift(newChallenge)
      localStorage.setItem('challenges', JSON.stringify(challenges))
      
      // Dispatch custom event to notify other pages
      window.dispatchEvent(new CustomEvent('challengesUpdated', { detail: challenges }))
      
      navigate(`/challenges/${newChallenge.id}`)
      return
    }
    
    // Handle article/resource creation (default)
    const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const article = {
      id: Date.now(),
      ...formData,
      tags: tagsArray,
      excerpt: formData.content.substring(0, 150) + (formData.content.length > 150 ? '...' : ''),
      author: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      downloads: 0
    }

    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    articles.unshift(article)
    localStorage.setItem('articles', JSON.stringify(articles))

    navigate(`/articles/${article.id}`)
  }

  if (!isAuthenticated) return null

  return (
    <div className="create-article-page">
      <div className="container">
        <div className="create-article card">
          <h1>
            {isProjectPage && 'Créer un nouveau projet'}
            {isChallengePage && 'Lancer un nouveau défi'}
            {!isProjectPage && !isChallengePage && 'Partager une ressource'}
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                {isProjectPage && 'Titre du projet *'}
                {isChallengePage && 'Titre du défi *'}
                {!isProjectPage && !isChallengePage && 'Titre de la ressource *'}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder={
                  isProjectPage ? "Ex: Analyse des données de santé en Guinée" :
                  isChallengePage ? "Ex: Défi : Analyse des données de transport" :
                  "Ex: Dataset des données économiques de Guinée 2023"
                }
              />
            </div>

            {!isProjectPage && !isChallengePage && (
              <div className="form-row">
                <div className="form-group">
                  <label>Type de ressource *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required>
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
                  <label>Niveau de difficulté</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="">Tous niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>
            )}

            {(isProjectPage || isChallengePage) && (
              <div className="form-row">
                {isProjectPage && (
                  <div className="form-group">
                    <label>Statut *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="recruiting">🔍 Recrutement</option>
                      <option value="active">🚀 En cours</option>
                      <option value="completed">✅ Terminé</option>
                    </select>
                  </div>
                )}
                {isProjectPage && (
                  <div className="form-group">
                    <label>Nombre maximum de membres *</label>
                    <input
                      type="number"
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      required
                      placeholder="Ex: 5"
                    />
                    <small className="form-hint">Nombre maximum de participants au projet</small>
                  </div>
                )}
                {isChallengePage && (
                  <div className="form-group">
                    <label>Niveau de difficulté *</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                      <option value="">Sélectionnez un niveau</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>
                {isProjectPage && 'Description du projet *'}
                {isChallengePage && 'Description du défi *'}
                {!isProjectPage && !isChallengePage && 'Description détaillée *'}
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="8"
                placeholder={
                  isProjectPage ? "Décrivez le projet en détail : objectifs, méthodologie, résultats attendus, etc..." :
                  isChallengePage ? "Décrivez le défi : objectifs, règles, critères d'évaluation, etc..." :
                  "Décrivez votre ressource : contenu, utilisation, cas d'usage, etc..."
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lien de téléchargement / URL</label>
                <input
                  type="url"
                  name="downloadLink"
                  value={formData.downloadLink}
                  onChange={handleChange}
                  placeholder="https://example.com/resource.zip ou lien Google Drive, Dropbox, etc."
                />
                <small className="form-hint">Lien vers le fichier ou la ressource (Drive, Dropbox, GitHub, etc.)</small>
              </div>

              <div className="form-group">
                <label>Format du fichier</label>
                <input
                  type="text"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  placeholder="Ex: CSV, XLSX, PDF, ZIP, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Taille du fichier</label>
                <input
                  type="text"
                  name="fileSize"
                  value={formData.fileSize}
                  onChange={handleChange}
                  placeholder="Ex: 15 MB, 2.5 GB"
                />
              </div>

              <div className="form-group">
                <label>Langue</label>
                <select name="language" value={formData.language} onChange={handleChange}>
                  <option value="">Toutes langues</option>
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                  <option value="Français/English">Français/English</option>
                </select>
              </div>
            </div>

            {(isProjectPage || isChallengePage) && (
              <div className="form-group">
                <label>Compétences requises (séparées par des virgules)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Ex: Python, Pandas, Visualisation, Machine Learning"
                />
                <small className="form-hint">Compétences nécessaires pour participer</small>
              </div>
            )}

            {!isProjectPage && !isChallengePage && (
              <div className="form-group">
                <label>Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Ex: Python, Pandas, Visualisation, Économie, Guinée"
                />
                <small className="form-hint">Aide les autres à trouver votre ressource</small>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => navigate(isProjectPage ? '/projects' : isChallengePage ? '/challenges' : '/articles')}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                {isProjectPage && '🚀 Créer le projet'}
                {isChallengePage && '🎯 Lancer le défi'}
                {!isProjectPage && !isChallengePage && '📤 Partager la ressource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateArticle

