import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import './Articles.css'

const Articles = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
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
    // Dataset specific
    rowCount: '',
    columnCount: '',
    period: '',
    source: '',
    // Tutoriel specific
    duration: '',
    prerequisites: '',
    // Code specific
    technology: '',
    repository: '',
    // Template specific
    tool: '',
    version: ''
  })

  useEffect(() => {
    // Load articles from localStorage
    const stored = JSON.parse(localStorage.getItem('articles') || '[]')
    
    // Always use stored data if available, otherwise use samples
    if (stored.length > 0) {
      setArticles(stored)
    } else if (stored.length === 0) {
      // Sample resources - Data Analysis focused
      const sampleArticles = [
        {
          id: 1,
          title: 'Dataset : Données démographiques de la Guinée 2023',
          excerpt: 'Dataset complet des données démographiques de la Guinée incluant population, répartition géographique, âge, genre et indicateurs sociaux.',
          content: 'Ce dataset complet contient les données démographiques officielles de la Guinée pour l\'année 2023. Il inclut la répartition de la population par région, tranches d\'âge, genre, taux d\'alphabétisation, et autres indicateurs sociaux clés. Parfait pour des analyses de tendances démographiques et des visualisations géographiques.',
          author: { name: 'Mamadou Diallo', avatar: null },
          category: 'Dataset',
          downloadLink: 'https://example.com/dataset-demographie-guinee-2023.csv',
          format: 'CSV',
          fileSize: '3.2 MB',
          tags: ['Démographie', 'Guinée', 'CSV', 'Analyse', 'Visualisation'],
          difficulty: 'Intermédiaire',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 234,
          likes: 68,
          downloads: 142
        },
        {
          id: 2,
          title: 'Tutoriel : Analyse exploratoire de données avec Python',
          excerpt: 'Guide complet pour effectuer une analyse exploratoire de données (EDA) avec Python, Pandas, Matplotlib et Seaborn.',
          content: 'Ce tutoriel détaillé vous apprendra à effectuer une analyse exploratoire de données complète avec Python. Vous découvrirez comment nettoyer les données, identifier les patterns, détecter les outliers, créer des visualisations pertinentes et tirer des insights actionnables. Inclut des exemples pratiques avec des datasets réels.',
          author: { name: 'Aissatou Bah', avatar: null },
          category: 'Tutoriel',
          downloadLink: 'https://example.com/tutoriel-eda-python.pdf',
          format: 'PDF',
          fileSize: '8.5 MB',
          tags: ['Python', 'Pandas', 'EDA', 'Visualisation', 'Data Science'],
          difficulty: 'Intermédiaire',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 312,
          likes: 89,
          downloads: 198
        },
        {
          id: 3,
          title: 'Template : Dashboard analytique Tableau pour KPIs',
          excerpt: 'Template professionnel de dashboard Tableau pour suivre les KPIs métier avec visualisations interactives et filtres dynamiques.',
          content: 'Un template Tableau complet et professionnel pour créer des dashboards analytiques performants. Inclut des visualisations pour suivre les KPIs, des filtres temporels, des comparaisons périodiques, et des graphiques interactifs. Parfait pour les analyses de performance et le reporting exécutif.',
          author: { name: 'Ibrahima Camara', avatar: null },
          category: 'Template',
          downloadLink: 'https://example.com/template-tableau-kpis.twbx',
          format: 'TWBX',
          fileSize: '15 MB',
          tags: ['Tableau', 'Dashboard', 'KPIs', 'Business Intelligence', 'Analytics'],
          difficulty: 'Avancé',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 187,
          likes: 54,
          downloads: 76
        },
        {
          id: 4,
          title: 'Dataset : Données de santé publique Guinée 2023',
          excerpt: 'Dataset complet des indicateurs de santé publique incluant morbidité, mortalité, couverture vaccinale et accès aux soins.',
          content: 'Dataset exhaustif des données de santé publique de la Guinée pour 2023. Contient des informations sur les principales maladies, taux de mortalité par région, couverture vaccinale, accès aux services de santé, et indicateurs de santé maternelle et infantile. Idéal pour des analyses épidémiologiques et des études de santé publique.',
          author: { name: 'Fatoumata Diallo', avatar: null },
          category: 'Dataset',
          downloadLink: 'https://example.com/dataset-sante-publique-guinee.csv',
          format: 'CSV',
          fileSize: '4.8 MB',
          tags: ['Santé', 'Épidémiologie', 'Public Health', 'Analyse', 'Guinée'],
          difficulty: 'Intermédiaire',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 156,
          likes: 42,
          downloads: 89
        },
        {
          id: 5,
          title: 'Tutoriel : Machine Learning pour prédiction de séries temporelles',
          excerpt: 'Apprenez à utiliser le Machine Learning pour prédire des séries temporelles avec Python, scikit-learn et Prophet.',
          content: 'Tutoriel approfondi sur l\'utilisation du Machine Learning pour la prédiction de séries temporelles. Vous apprendrez à préparer les données temporelles, choisir les bons modèles (ARIMA, Prophet, LSTM), évaluer les performances et déployer vos modèles. Inclut des cas d\'usage pratiques comme la prévision de ventes, de demande, ou d\'indicateurs économiques.',
          author: { name: 'Ousmane Barry', avatar: null },
          category: 'Tutoriel',
          downloadLink: 'https://example.com/tutoriel-ml-time-series.pdf',
          format: 'PDF',
          fileSize: '12 MB',
          tags: ['Machine Learning', 'Time Series', 'Python', 'Prédiction', 'Data Science'],
          difficulty: 'Avancé',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 278,
          likes: 73,
          downloads: 124
        },
        {
          id: 6,
          title: 'Outil : Script Python pour nettoyage automatique de données',
          excerpt: 'Script Python réutilisable pour automatiser le nettoyage de données : gestion des valeurs manquantes, outliers, doublons.',
          content: 'Script Python complet et documenté pour automatiser le nettoyage de données. Gère automatiquement les valeurs manquantes, détecte et traite les outliers, supprime les doublons, normalise les formats de dates, et génère un rapport de qualité des données. Compatible avec Pandas et peut être intégré dans vos pipelines de données.',
          author: { name: 'Mariam Sow', avatar: null },
          category: 'Code',
          downloadLink: 'https://example.com/script-data-cleaning.py',
          format: 'PY',
          fileSize: '45 KB',
          tags: ['Python', 'Data Cleaning', 'Automation', 'Pandas', 'Script'],
          difficulty: 'Intermédiaire',
          language: 'Python',
          createdAt: new Date().toISOString(),
          views: 421,
          likes: 112,
          downloads: 267
        },
        {
          id: 7,
          title: 'Documentation : Guide complet de SQL pour Data Analysts',
          excerpt: 'Documentation exhaustive sur SQL avec focus sur les requêtes analytiques, fonctions window, CTEs et optimisations.',
          content: 'Guide complet de SQL spécialement conçu pour les data analysts. Couvre les requêtes analytiques avancées, les fonctions window (ROW_NUMBER, RANK, LAG, LEAD), les CTEs (Common Table Expressions), les jointures complexes, l\'optimisation des performances, et les bonnes pratiques. Inclut des exemples pratiques pour chaque concept.',
          author: { name: 'Amadou Diallo', avatar: null },
          category: 'Documentation',
          downloadLink: 'https://example.com/guide-sql-data-analysts.pdf',
          format: 'PDF',
          fileSize: '6.3 MB',
          tags: ['SQL', 'Database', 'Analytics', 'Query', 'Documentation'],
          difficulty: 'Intermédiaire',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 389,
          likes: 95,
          downloads: 201
        },
        {
          id: 8,
          title: 'Dataset : Données économiques et financières Guinée 2023',
          excerpt: 'Dataset complet des indicateurs économiques et financiers : PIB, inflation, commerce extérieur, investissements, dette publique.',
          content: 'Dataset exhaustif des données économiques et financières de la Guinée pour 2023. Inclut le PIB par secteur, taux d\'inflation, balance commerciale, investissements directs étrangers, dette publique, réserves de change, et autres indicateurs macroéconomiques. Parfait pour des analyses économiques, des prévisions et des visualisations de tendances économiques.',
          author: { name: 'Sékou Touré', avatar: null },
          category: 'Dataset',
          downloadLink: 'https://example.com/dataset-economie-guinee-2023.csv',
          format: 'CSV',
          fileSize: '2.9 MB',
          tags: ['Économie', 'Finance', 'Macroéconomie', 'Guinée', 'Analyse'],
          difficulty: 'Intermédiaire',
          language: 'Français',
          createdAt: new Date().toISOString(),
          views: 198,
          likes: 56,
          downloads: 98
        }
      ]
      setArticles(sampleArticles)
      localStorage.setItem('articles', JSON.stringify(sampleArticles))
    }
  }, [])

  // Reload articles when localStorage changes (for admin-created resources)
  useEffect(() => {
    const handleArticlesUpdate = (e) => {
      if (e.detail) {
        setArticles(e.detail)
      } else {
        const stored = JSON.parse(localStorage.getItem('articles') || '[]')
        if (stored.length > 0) {
          setArticles(stored)
        }
      }
    }

    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem('articles') || '[]')
      if (stored.length > 0) {
        setArticles(stored)
      }
    }

    window.addEventListener('articlesUpdated', handleArticlesUpdate)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('articlesUpdated', handleArticlesUpdate)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const categories = ['all', 'Dataset', 'Tutoriel', 'Outil', 'Template', 'Documentation', 'Code', 'Livre']

  const filteredArticles = articles.filter(article => {
    const matchesFilter = filter === 'all' || article.category === filter
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const getCategoryIcon = (category) => {
    const icons = {
      'Dataset': '📊',
      'Tutoriel': '📚',
      'Outil': '🛠️',
      'Template': '📋',
      'Documentation': '📖',
      'Code': '💻',
      'Livre': '📗',
      'Autre': '📦'
    }
    return icons[category] || '📦'
  }

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    // Clean up form data - only include relevant fields based on category
    const articleData = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      downloadLink: formData.downloadLink,
      fileSize: formData.fileSize,
      format: formData.format,
      tags: tagsArray,
      difficulty: formData.difficulty,
      language: formData.language,
      excerpt: formData.content.substring(0, 150) + (formData.content.length > 150 ? '...' : ''),
      author: { id: user.id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      downloads: 0
    }

    // Add category-specific fields
    if (formData.category === 'Dataset') {
      articleData.rowCount = formData.rowCount
      articleData.columnCount = formData.columnCount
      articleData.period = formData.period
      articleData.source = formData.source
    } else if (formData.category === 'Tutoriel') {
      articleData.duration = formData.duration
      articleData.prerequisites = formData.prerequisites
    } else if (formData.category === 'Code') {
      articleData.technology = formData.technology
      articleData.repository = formData.repository
    } else if (formData.category === 'Template') {
      articleData.tool = formData.tool
      articleData.version = formData.version
    }

    const newArticle = articleData

    const updatedArticles = [newArticle, ...articles]
    setArticles(updatedArticles)
    localStorage.setItem('articles', JSON.stringify(updatedArticles))

    // Reset form
    setFormData({
      title: '',
      content: '',
      category: '',
      downloadLink: '',
      fileSize: '',
      format: '',
      tags: '',
      difficulty: '',
      language: '',
      rowCount: '',
      columnCount: '',
      period: '',
      source: '',
      duration: '',
      prerequisites: '',
      technology: '',
      repository: '',
      tool: '',
      version: ''
    })
    setShowForm(false)
    
    // Navigate to the new article
    navigate(`/articles/${newArticle.id}`)
  }

  return (
    <div className="articles-page">
      <PageHeader
        title="Ressources"
        subtitle="Partagez et accédez à des datasets, tutoriels, outils et bonnes pratiques pour les data analysts"
        imageUrls={[
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80'
        ]}
      />
      <div className="container">
        {/* Search and Share Button Row */}
        <div className="search-share-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {isAuthenticated && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn btn-primary"
            >
              {showForm ? '✕ Annuler' : '+ Partager une ressource'}
            </button>
          )}
        </div>

        {/* Share Form */}
        {showForm && isAuthenticated && (
          <div className="share-form-container card">
            <h2>Partager une ressource</h2>
            <form onSubmit={handleFormSubmit} className="share-form">
              <div className="form-group">
                <label>Titre de la ressource *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  placeholder="Ex: Dataset des données économiques de Guinée 2023"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de ressource *</label>
                  <select name="category" value={formData.category} onChange={handleFormChange} required>
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
                  <select name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                    <option value="">Tous niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description détaillée *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  required
                  rows="6"
                  placeholder="Décrivez votre ressource : contenu, utilisation, cas d'usage, etc..."
                />
              </div>

              {/* Common fields for all categories */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    {formData.category === 'Tutoriel' ? 'Lien de la vidéo / URL' : 
                     formData.category === 'Outil' ? 'Lien vers l\'outil / URL' :
                     formData.category === 'Documentation' ? 'Lien de la documentation / URL' :
                     formData.category === 'Livre' ? 'Lien du livre / URL' :
                     'Lien de téléchargement / URL'}
                    {formData.category && <span className="required"> *</span>}
                  </label>
                  <input
                    type="url"
                    name="downloadLink"
                    value={formData.downloadLink}
                    onChange={handleFormChange}
                    required={!!formData.category}
                    placeholder={
                      formData.category === 'Tutoriel' ? 'https://youtube.com/... ou https://vimeo.com/...' :
                      formData.category === 'Outil' ? 'https://example.com/tool' :
                      formData.category === 'Documentation' ? 'https://docs.example.com' :
                      formData.category === 'Livre' ? 'https://example.com/book.pdf' :
                      'https://example.com/resource.zip ou lien Google Drive, Dropbox, etc.'
                    }
                  />
                  <small className="form-hint">
                    {formData.category === 'Tutoriel' ? 'Lien YouTube, Vimeo ou fichier vidéo (.mp4, .webm)' :
                     formData.category === 'Outil' ? 'URL de l\'outil en ligne ou lien de téléchargement' :
                     formData.category === 'Documentation' ? 'URL de la documentation ou lien de téléchargement' :
                     formData.category === 'Livre' ? 'Lien vers le livre (PDF, e-book, etc.)' :
                     'Lien vers le fichier ou la ressource (Drive, Dropbox, GitHub, etc.)'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Format {formData.category && <span className="required"> *</span>}</label>
                  <input
                    type="text"
                    name="format"
                    value={formData.format}
                    onChange={handleFormChange}
                    required={!!formData.category}
                    placeholder={
                      formData.category === 'Dataset' ? 'Ex: CSV, XLSX, JSON, Parquet' :
                      formData.category === 'Tutoriel' ? 'Ex: Vidéo MP4, YouTube, Vimeo' :
                      formData.category === 'Code' ? 'Ex: Python, R, SQL, JavaScript' :
                      formData.category === 'Outil' ? 'Ex: Web App, Extension, Plugin' :
                      formData.category === 'Template' ? 'Ex: Excel, Power BI, Tableau' :
                      formData.category === 'Documentation' ? 'Ex: PDF, HTML, Markdown' :
                      formData.category === 'Livre' ? 'Ex: PDF, EPUB, MOBI' :
                      'Ex: CSV, XLSX, PDF, ZIP, etc.'
                    }
                  />
                </div>
              </div>

              {(formData.category === 'Dataset' || formData.category === 'Code' || formData.category === 'Livre' || formData.category === 'Documentation') && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Taille du fichier</label>
                    <input
                      type="text"
                      name="fileSize"
                      value={formData.fileSize}
                      onChange={handleFormChange}
                      placeholder="Ex: 15 MB, 2.5 GB"
                    />
                  </div>

                  <div className="form-group">
                    <label>Langue</label>
                    <select name="language" value={formData.language} onChange={handleFormChange}>
                      <option value="">Toutes langues</option>
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="Français/English">Français/English</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dataset Specific Fields */}
              {formData.category === 'Dataset' && (
                <div className="category-specific-fields">
                  <h3>📊 Informations sur le Dataset</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de lignes</label>
                      <input
                        type="text"
                        name="rowCount"
                        value={formData.rowCount}
                        onChange={handleFormChange}
                        placeholder="Ex: 10 000, 1M+"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nombre de colonnes</label>
                      <input
                        type="text"
                        name="columnCount"
                        value={formData.columnCount}
                        onChange={handleFormChange}
                        placeholder="Ex: 15, 50+"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Période couverte</label>
                      <input
                        type="text"
                        name="period"
                        value={formData.period}
                        onChange={handleFormChange}
                        placeholder="Ex: 2020-2023, Janvier 2024"
                      />
                    </div>
                    <div className="form-group">
                      <label>Source des données</label>
                      <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleFormChange}
                        placeholder="Ex: Ministère de l'Économie, INSEE, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tutoriel Specific Fields */}
              {formData.category === 'Tutoriel' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">📚</span>
                    <h3>Informations sur le Tutoriel</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Durée du tutoriel</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleFormChange}
                        placeholder="Ex: 2h 30min, 45min, 1h 15min"
                      />
                      <small className="form-hint">Durée estimée pour compléter le tutoriel</small>
                    </div>
                    <div className="form-group">
                      <label>Prérequis</label>
                      <input
                        type="text"
                        name="prerequisites"
                        value={formData.prerequisites}
                        onChange={handleFormChange}
                        placeholder="Ex: Python de base, Connaissances en statistiques"
                      />
                      <small className="form-hint">Compétences ou connaissances nécessaires</small>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Langue du tutoriel</label>
                    <select name="language" value={formData.language} onChange={handleFormChange}>
                      <option value="">Sélectionnez</option>
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="Français/English">Français/English</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Code Specific Fields */}
              {formData.category === 'Code' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">💻</span>
                    <h3>Informations sur le Code</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Technologie / Langage *</label>
                      <input
                        type="text"
                        name="technology"
                        value={formData.technology}
                        onChange={handleFormChange}
                        required
                        placeholder="Ex: Python, R, SQL, JavaScript, Java"
                      />
                    </div>
                    <div className="form-group">
                      <label>Repository (GitHub, GitLab, etc.)</label>
                      <input
                        type="url"
                        name="repository"
                        value={formData.repository}
                        onChange={handleFormChange}
                        placeholder="https://github.com/user/repo"
                      />
                      <small className="form-hint">Lien vers le dépôt de code (optionnel)</small>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Version</label>
                      <input
                        type="text"
                        name="version"
                        value={formData.version || ''}
                        onChange={handleFormChange}
                        placeholder="Ex: 1.0.0, 2.3.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Langue</label>
                      <select name="language" value={formData.language} onChange={handleFormChange}>
                        <option value="">Toutes langues</option>
                        <option value="Français">Français</option>
                        <option value="English">English</option>
                        <option value="Français/English">Français/English</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Specific Fields */}
              {formData.category === 'Template' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">📋</span>
                    <h3>Informations sur le Template</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Outil compatible *</label>
                      <input
                        type="text"
                        name="tool"
                        value={formData.tool}
                        onChange={handleFormChange}
                        required
                        placeholder="Ex: Excel, Power BI, Tableau, Google Sheets"
                      />
                    </div>
                    <div className="form-group">
                      <label>Version</label>
                      <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleFormChange}
                        placeholder="Ex: 2023, 1.0, v2.1"
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
                        onChange={handleFormChange}
                        placeholder="Ex: 5 MB, 250 KB"
                      />
                    </div>
                    <div className="form-group">
                      <label>Langue</label>
                      <select name="language" value={formData.language} onChange={handleFormChange}>
                        <option value="">Toutes langues</option>
                        <option value="Français">Français</option>
                        <option value="English">English</option>
                        <option value="Français/English">Français/English</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Outil Specific Fields */}
              {formData.category === 'Outil' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">🛠️</span>
                    <h3>Informations sur l'Outil</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type d'outil *</label>
                      <select name="format" value={formData.format} onChange={handleFormChange} required>
                        <option value="">Sélectionnez</option>
                        <option value="Web App">Application Web</option>
                        <option value="Extension">Extension navigateur</option>
                        <option value="Plugin">Plugin</option>
                        <option value="Desktop">Application Desktop</option>
                        <option value="API">API</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gratuit / Payant</label>
                      <select name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                        <option value="">Sélectionnez</option>
                        <option value="Gratuit">Gratuit</option>
                        <option value="Freemium">Freemium</option>
                        <option value="Payant">Payant</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Langue</label>
                    <select name="language" value={formData.language} onChange={handleFormChange}>
                      <option value="">Toutes langues</option>
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="Français/English">Français/English</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Documentation Specific Fields */}
              {formData.category === 'Documentation' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">📖</span>
                    <h3>Informations sur la Documentation</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type de documentation *</label>
                      <select name="format" value={formData.format} onChange={handleFormChange} required>
                        <option value="">Sélectionnez</option>
                        <option value="PDF">PDF</option>
                        <option value="HTML">Site Web / HTML</option>
                        <option value="Markdown">Markdown</option>
                        <option value="Wiki">Wiki</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Taille du fichier</label>
                      <input
                        type="text"
                        name="fileSize"
                        value={formData.fileSize}
                        onChange={handleFormChange}
                        placeholder="Ex: 5 MB, 250 KB"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Langue</label>
                    <select name="language" value={formData.language} onChange={handleFormChange}>
                      <option value="">Toutes langues</option>
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="Français/English">Français/English</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Livre Specific Fields */}
              {formData.category === 'Livre' && (
                <div className="category-specific-fields">
                  <div className="category-fields-header">
                    <span className="category-icon">📗</span>
                    <h3>Informations sur le Livre</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Auteur</label>
                      <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleFormChange}
                        placeholder="Ex: John Doe, Jane Smith"
                      />
                    </div>
                    <div className="form-group">
                      <label>Année de publication</label>
                      <input
                        type="text"
                        name="period"
                        value={formData.period}
                        onChange={handleFormChange}
                        placeholder="Ex: 2023, 2022-2023"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>ISBN (optionnel)</label>
                      <input
                        type="text"
                        name="rowCount"
                        value={formData.rowCount}
                        onChange={handleFormChange}
                        placeholder="Ex: 978-0-123456-78-9"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nombre de pages</label>
                      <input
                        type="text"
                        name="columnCount"
                        value={formData.columnCount}
                        onChange={handleFormChange}
                        placeholder="Ex: 350, 500+"
                        inputMode="numeric"
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
                        onChange={handleFormChange}
                        placeholder="Ex: 15 MB, 2.5 GB"
                      />
                    </div>
                    <div className="form-group">
                      <label>Langue</label>
                      <select name="language" value={formData.language} onChange={handleFormChange}>
                        <option value="">Toutes langues</option>
                        <option value="Français">Français</option>
                        <option value="English">English</option>
                        <option value="Français/English">Français/English</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  placeholder="Ex: Python, Pandas, Visualisation, Économie, Guinée"
                />
                <small className="form-hint">Aide les autres à trouver votre ressource</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => {
                  setShowForm(false)
                  setFormData({
                    title: '',
                    content: '',
                    category: '',
                    downloadLink: '',
                    fileSize: '',
                    format: '',
                    tags: '',
                    difficulty: '',
                    language: '',
                    rowCount: '',
                    columnCount: '',
                    period: '',
                    source: '',
                    duration: '',
                    prerequisites: '',
                    technology: '',
                    repository: '',
                    tool: '',
                    version: ''
                  })
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  📤 Partager la ressource
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filters */}
        <div className="resources-filters">
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'Tous' : `${getCategoryIcon(cat)} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <Link key={article.id} to={`/articles/${article.id}`} className="article-card card">
              <div className="article-header">
                <div className="article-category">
                  {getCategoryIcon(article.category)} {article.category}
                </div>
                {article.difficulty && (
                  <span className="difficulty-badge">{article.difficulty}</span>
                )}
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt || article.content?.substring(0, 120) + '...'}</p>
              
              {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                  {article.tags.length > 3 && <span className="tag-more">+{article.tags.length - 3}</span>}
                </div>
              )}

              <div className="article-meta">
                {article.format && <span className="meta-item">📄 {article.format}</span>}
                {article.fileSize && <span className="meta-item">💾 {article.fileSize}</span>}
                {article.language && <span className="meta-item">🌐 {article.language}</span>}
              </div>

              <div className="article-footer">
                <div className="article-author">
                  {article.author.avatar ? (
                    <img src={article.author.avatar} alt={article.author.name} />
                  ) : (
                    <span>{article.author.name.charAt(0)}</span>
                  )}
                  <span>{article.author.name}</span>
                </div>
                <div className="article-stats">
                  <span>👁️ {article.views || 0}</span>
                  <span>❤️ {article.likes || 0}</span>
                  {article.downloads !== undefined && <span>⬇️ {article.downloads || 0}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="empty-state">
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Aucune ressource ne correspond à votre recherche.' 
                : 'Aucune ressource pour le moment. Soyez le premier à en partager une !'}
            </p>
            {isAuthenticated && (
              <Link to="/articles/create" className="btn btn-primary">
                Partager une ressource
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Articles

