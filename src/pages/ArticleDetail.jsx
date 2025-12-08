import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import CourseRecommendations from '../components/CourseRecommendations'
import './ArticleDetail.css'

const ArticleDetail = () => {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)

  useEffect(() => {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const found = articles.find(a => a.id === parseInt(id))
    
    if (found) {
      // Increment views
      found.views = (found.views || 0) + 1
      const updated = articles.map(a => a.id === parseInt(id) ? found : a)
      localStorage.setItem('articles', JSON.stringify(updated))
      setArticle(found)
      
      // Save to user's viewing history
      if (isAuthenticated && user?.id) {
        const history = JSON.parse(localStorage.getItem(`viewHistory_${user.id}`) || '[]')
        const historyEntry = {
          resourceId: found.id,
          category: found.category,
          tags: found.tags || [],
          viewedAt: new Date().toISOString()
        }
        // Add to beginning and keep only last 50
        const updatedHistory = [historyEntry, ...history.filter(h => h.resourceId !== found.id)].slice(0, 50)
        localStorage.setItem(`viewHistory_${user.id}`, JSON.stringify(updatedHistory))
      }
    }
  }, [id, isAuthenticated, user?.id])

  // Check if resource is downloadable (file) or viewable (website)
  const isDownloadable = () => {
    if (!article.downloadLink) return false
    
    // Datasets are always downloadable
    if (article.category === 'Dataset') {
      return true
    }
    
    const url = article.downloadLink.toLowerCase()
    const downloadableExtensions = [
      '.pdf', '.zip', '.rar', '.7z', '.tar', '.gz',
      '.csv', '.xlsx', '.xls', '.json', '.xml', '.parquet',
      '.py', '.r', '.sql', '.js', '.ts', '.java',
      '.png', '.jpg', '.jpeg', '.gif', '.svg',
      '.mp4', '.mp3', '.avi', '.mov',
      '.doc', '.docx', '.ppt', '.pptx',
      '.txt', '.md', '.html', '.css'
    ]
    
    // Check if URL ends with a file extension
    const hasExtension = downloadableExtensions.some(ext => url.includes(ext))
    
    // Check if format field indicates a file type
    const format = article.format?.toLowerCase() || ''
    const isFileFormat = format && !format.includes('http') && !format.includes('www')
    
    // Check if it's a direct file link (not a website)
    const isDirectFile = hasExtension || 
                        url.includes('/download') || 
                        url.includes('/file') ||
                        url.includes('drive.google.com/file') ||
                        url.includes('dropbox.com/s') ||
                        url.includes('github.com/') && (url.includes('/raw/') || url.includes('/blob/'))
    
    return isDirectFile || (isFileFormat && !url.includes('http://') && !url.includes('https://'))
  }

  const handleDownload = () => {
    if (!article.downloadLink) return
    
    const downloadable = isDownloadable()
    
    if (downloadable) {
      // Increment downloads for downloadable files
      const articles = JSON.parse(localStorage.getItem('articles') || '[]')
      const updated = articles.map(a => {
        if (a.id === article.id) {
          return { ...a, downloads: (a.downloads || 0) + 1 }
        }
        return a
      })
      localStorage.setItem('articles', JSON.stringify(updated))
      setArticle({ ...article, downloads: (article.downloads || 0) + 1 })
      
      // For datasets, try to force download
      if (article.category === 'Dataset') {
        // Get file extension from format or URL
        const format = article.format?.toLowerCase() || ''
        const urlLower = article.downloadLink.toLowerCase()
        let extension = '.csv' // Default for datasets
        
        if (format.includes('xlsx') || urlLower.includes('.xlsx')) extension = '.xlsx'
        else if (format.includes('xls') || urlLower.includes('.xls')) extension = '.xls'
        else if (format.includes('json') || urlLower.includes('.json')) extension = '.json'
        else if (format.includes('xml') || urlLower.includes('.xml')) extension = '.xml'
        else if (format.includes('parquet') || urlLower.includes('.parquet')) extension = '.parquet'
        else if (urlLower.includes('.csv')) extension = '.csv'
        else if (urlLower.includes('.tsv')) extension = '.tsv'
        else if (urlLower.includes('.txt')) extension = '.txt'
        
        // Create filename from title
        const filename = (article.title || 'dataset').replace(/[^a-z0-9]/gi, '_').toLowerCase() + extension
        
        // Try to fetch and download the file (for CORS-enabled URLs)
        fetch(article.downloadLink, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        })
          .then(response => {
            if (response.ok) {
              return response.blob()
            }
            throw new Error('Network response was not ok')
          })
          .then(blob => {
            // Create blob URL and trigger download
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            // Clean up the blob URL after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(url)
            }, 100)
          })
          .catch(error => {
            console.log('Fetch failed, using direct download:', error)
            // Fallback: use direct download link
            const link = document.createElement('a')
            link.href = article.downloadLink
            link.download = filename
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          })
      } else {
        // For other file types, use standard download
        const link = document.createElement('a')
        link.href = article.downloadLink
        link.download = article.title || 'resource'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      // Open website in new tab
      window.open(article.downloadLink, '_blank', 'noopener,noreferrer')
    }
  }

  const handleView = () => {
    if (!article.downloadLink) return
    
    // Increment views
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const updated = articles.map(a => {
      if (a.id === article.id) {
        return { ...a, views: (a.views || 0) + 1 }
      }
      return a
    })
    localStorage.setItem('articles', JSON.stringify(updated))
    setArticle({ ...article, views: (article.views || 0) + 1 })
    
    // Open website in new tab
    window.open(article.downloadLink, '_blank', 'noopener,noreferrer')
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour aimer une ressource')
      return
    }
    
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const updated = articles.map(a => {
      if (a.id === article.id) {
        return { ...a, likes: (a.likes || 0) + 1 }
      }
      return a
    })
    localStorage.setItem('articles', JSON.stringify(updated))
    setArticle({ ...article, likes: (article.likes || 0) + 1 })
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="article-detail card">
            <p>Ressource non trouvée</p>
            <Link to="/articles" className="btn btn-primary">Retour aux ressources</Link>
          </div>
        </div>
      </div>
    )
  }

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

  // Check if resource is a video
  const isVideo = () => {
    if (!article?.downloadLink) return false
    
    const url = article.downloadLink.toLowerCase()
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.flv', '.wmv']
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'dai.ly', 'twitch.tv', 'facebook.com/watch', 'instagram.com/tv']
    
    const hasVideoExtension = videoExtensions.some(ext => url.includes(ext))
    const isVideoHost = videoHosts.some(host => url.includes(host))
    const format = article.format?.toLowerCase() || ''
    const isVideoFormat = format.includes('video') || format.includes('mp4') || format.includes('youtube') || format.includes('vimeo')
    
    // Pour les tutoriels, considérer comme vidéo si c'est un lien vers une plateforme vidéo
    const isTutorialVideo = article.category === 'Tutoriel' && (isVideoHost || hasVideoExtension || isVideoFormat)
    
    return hasVideoExtension || isVideoHost || isVideoFormat || isTutorialVideo
  }

  // Extract video URL (handle YouTube, Vimeo, etc.)
  const getVideoUrl = () => {
    if (!article?.downloadLink) return null
    
    const url = article.downloadLink
    
    // YouTube
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = null
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0]
      } else if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0]
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
    
    // Dailymotion
    if (url.includes('dailymotion.com/video/') || url.includes('dai.ly/')) {
      let videoId = null
      if (url.includes('dai.ly/')) {
        videoId = url.split('dai.ly/')[1]?.split('?')[0]
      } else if (url.includes('dailymotion.com/video/')) {
        videoId = url.split('dailymotion.com/video/')[1]?.split('?')[0]?.split('_')[0]
      }
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : null
    }
    
    // Direct video file (MP4, WebM, etc.)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v']
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext))
    if (hasVideoExtension) {
      return url
    }
    
    // Si c'est un tutoriel et que le lien semble être une vidéo, retourner le lien original
    if (article.category === 'Tutoriel') {
      return url
    }
    
    return null
  }

  return (
    <div className="article-detail-page">
      <div className="container">
        <Link to="/articles" className="back-link">← Retour aux ressources</Link>
        
        <div className="article-detail card">
          <div className="article-detail-header">
            <div className="article-detail-category">
              {getCategoryIcon(article.category)} {article.category}
            </div>
            {article.difficulty && (
              <span className="difficulty-badge">{article.difficulty}</span>
            )}
          </div>

          <h1>{article.title}</h1>

          <div className="article-detail-meta">
            <div className="article-author-large">
              {article.author.avatar ? (
                <img src={article.author.avatar} alt={article.author.name} />
              ) : (
                <span>{article.author.name.charAt(0)}</span>
              )}
              <div>
                <div className="author-name">{article.author.name}</div>
                <div className="article-date">
                  {new Date(article.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div className="article-stats-large">
              <span>👁️ {article.views || 0} vues</span>
              <button onClick={handleLike} className="like-btn">
                ❤️ {article.likes || 0}
              </button>
              {article.downloads !== undefined && (
                <span>⬇️ {article.downloads || 0} téléchargements</span>
              )}
            </div>
          </div>

          <div className="article-content">
            <p>{article.content || article.excerpt}</p>
          </div>

          {/* Video Player - Section spéciale pour les tutoriels vidéo */}
          {article.category === 'Tutoriel' && isVideo() && getVideoUrl() && (
            <div className="article-video-section tutorial-video-section">
              <div className="tutorial-video-header">
                <h3>📹 Vidéo du tutoriel</h3>
                <div className="tutorial-video-actions">
                  <button
                    onClick={() => {
                      window.open(article.downloadLink, '_blank', 'noopener,noreferrer')
                      // Increment views
                      const articles = JSON.parse(localStorage.getItem('articles') || '[]')
                      const updated = articles.map(a => {
                        if (a.id === article.id) {
                          return { ...a, views: (a.views || 0) + 1 }
                        }
                        return a
                      })
                      localStorage.setItem('articles', JSON.stringify(updated))
                      setArticle({ ...article, views: (article.views || 0) + 1 })
                    }}
                    className="btn btn-secondary btn-open-external"
                    title="Ouvrir la vidéo dans un nouvel onglet"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ouvrir ailleurs
                  </button>
                </div>
              </div>
              
              {getVideoUrl().includes('youtube.com/embed') || getVideoUrl().includes('vimeo.com/video') ? (
                <div className="video-embed-container">
                  <iframe
                    src={getVideoUrl()}
                    title={article.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-embed"
                  />
                </div>
              ) : (
                <VideoPlayer
                  src={getVideoUrl()}
                  title={article.title}
                  poster={article.thumbnail || article.image}
                />
              )}
              
              <p className="tutorial-video-hint">
                💡 Vous pouvez regarder la vidéo directement ici ou l'ouvrir dans un nouvel onglet en cliquant sur "Ouvrir ailleurs"
              </p>
            </div>
          )}

          {/* Video Player pour les autres catégories */}
          {article.category !== 'Tutoriel' && isVideo() && getVideoUrl() && (
            <div className="article-video-section">
              {getVideoUrl().includes('youtube.com/embed') || getVideoUrl().includes('vimeo.com/video') ? (
                <div className="video-embed-container">
                  <iframe
                    src={getVideoUrl()}
                    title={article.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-embed"
                  />
                </div>
              ) : (
                <VideoPlayer
                  src={getVideoUrl()}
                  title={article.title}
                  poster={article.thumbnail || article.image}
                />
              )}
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="article-tags-large">
              <strong>Tags :</strong>
              <div className="tags-list">
                {article.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="article-info-grid">
            {article.format && (
              <div className="info-item">
                <span className="info-label">📄 Format :</span>
                <span className="info-value">{article.format}</span>
              </div>
            )}
            {article.fileSize && (
              <div className="info-item">
                <span className="info-label">💾 Taille :</span>
                <span className="info-value">{article.fileSize}</span>
              </div>
            )}
            {article.language && (
              <div className="info-item">
                <span className="info-label">🌐 Langue :</span>
                <span className="info-value">{article.language}</span>
              </div>
            )}
            {article.difficulty && (
              <div className="info-item">
                <span className="info-label">📊 Niveau :</span>
                <span className="info-value">{article.difficulty}</span>
              </div>
            )}
            {/* Dataset specific info */}
            {article.category === 'Dataset' && (
              <>
                {article.rowCount && (
                  <div className="info-item">
                    <span className="info-label">📊 Lignes :</span>
                    <span className="info-value">{article.rowCount}</span>
                  </div>
                )}
                {article.columnCount && (
                  <div className="info-item">
                    <span className="info-label">📋 Colonnes :</span>
                    <span className="info-value">{article.columnCount}</span>
                  </div>
                )}
                {article.period && (
                  <div className="info-item">
                    <span className="info-label">📅 Période :</span>
                    <span className="info-value">{article.period}</span>
                  </div>
                )}
                {article.source && (
                  <div className="info-item">
                    <span className="info-label">🔗 Source :</span>
                    <span className="info-value">{article.source}</span>
                  </div>
                )}
              </>
            )}
            {/* Tutoriel specific info */}
            {article.category === 'Tutoriel' && (
              <>
                {article.duration && (
                  <div className="info-item">
                    <span className="info-label">⏱️ Durée :</span>
                    <span className="info-value">{article.duration}</span>
                  </div>
                )}
                {article.prerequisites && (
                  <div className="info-item">
                    <span className="info-label">📚 Prérequis :</span>
                    <span className="info-value">{article.prerequisites}</span>
                  </div>
                )}
              </>
            )}
            {/* Code specific info */}
            {article.category === 'Code' && (
              <>
                {article.technology && (
                  <div className="info-item">
                    <span className="info-label">💻 Technologie :</span>
                    <span className="info-value">{article.technology}</span>
                  </div>
                )}
                {article.repository && (
                  <div className="info-item">
                    <span className="info-label">🔗 Repository :</span>
                    <a href={article.repository} target="_blank" rel="noopener noreferrer" className="info-value link">
                      {article.repository}
                    </a>
                  </div>
                )}
              </>
            )}
            {/* Template specific info */}
            {article.category === 'Template' && (
              <>
                {article.tool && (
                  <div className="info-item">
                    <span className="info-label">🛠️ Outil :</span>
                    <span className="info-value">{article.tool}</span>
                  </div>
                )}
                {article.version && (
                  <div className="info-item">
                    <span className="info-label">📌 Version :</span>
                    <span className="info-value">{article.version}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section de téléchargement/accès - Masquée pour les tutoriels vidéo (déjà géré ci-dessus) */}
          {article.downloadLink && !(article.category === 'Tutoriel' && isVideo()) && (
            <div className="download-section">
              {isDownloadable() ? (
                <>
                  <button onClick={handleDownload} className="btn btn-primary btn-large">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Télécharger la ressource
                  </button>
                  <a 
                    href={article.downloadLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-link"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDownload()
                    }}
                  >
                    Ou ouvrir le lien directement
                  </a>
                </>
              ) : (
                <>
                  <button onClick={handleView} className="btn btn-primary btn-large">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Voir sur le site
                  </button>
                  <p className="view-hint">
                    Cette ressource sera ouverte dans un nouvel onglet
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Pour les tutoriels non-vidéo, afficher le lien de téléchargement normal */}
          {article.category === 'Tutoriel' && !isVideo() && article.downloadLink && (
            <div className="download-section">
              {isDownloadable() ? (
                <>
                  <button onClick={handleDownload} className="btn btn-primary btn-large">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Télécharger le tutoriel
                  </button>
                  <a 
                    href={article.downloadLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-link"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDownload()
                    }}
                  >
                    Ou ouvrir le lien directement
                  </a>
                </>
              ) : (
                <>
                  <button onClick={handleView} className="btn btn-primary btn-large">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Voir le tutoriel
                  </button>
                  <p className="view-hint">
                    Ce tutoriel sera ouvert dans un nouvel onglet
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Course Recommendations */}
        <CourseRecommendations
          currentResource={article}
          currentResourceId={article.id}
          currentCategory={article.category}
          currentTags={article.tags || []}
        />
      </div>
    </div>
  )
}

export default ArticleDetail

