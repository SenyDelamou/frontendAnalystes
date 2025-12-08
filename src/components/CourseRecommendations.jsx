import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './CourseRecommendations.css'

const CourseRecommendations = ({ currentResource, currentResourceId, currentCategory, currentTags = [] }) => {
  const { isAuthenticated, user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = () => {
      setLoading(true)
      
      const articles = JSON.parse(localStorage.getItem('articles') || '[]')
      
      // Filter out current resource
      let filtered = articles.filter(a => a.id !== currentResourceId)
      
      if (filtered.length === 0) {
        setRecommendations([])
        setLoading(false)
        return
      }
      
      // Get user's viewing history for personalized recommendations
      let userHistory = []
      if (isAuthenticated && user?.id) {
        const history = JSON.parse(localStorage.getItem(`viewHistory_${user.id}`) || '[]')
        userHistory = history.map(h => h.category || h.tags || []).flat()
      }
      
      // Score resources based on relevance to CURRENT resource
      const scoredResources = filtered.map(resource => {
        let score = 0
        
        // 1. Same category gets highest priority (weight: 15)
        if (resource.category === currentCategory) {
          score += 15
        }
        
        // 2. Matching tags - very important (weight: 8 per tag)
        if (resource.tags && currentTags && currentTags.length > 0) {
          const matchingTags = resource.tags.filter(tag => 
            currentTags.some(ct => ct.toLowerCase() === tag.toLowerCase())
          )
          score += matchingTags.length * 8
          
          // Bonus if many tags match
          if (matchingTags.length === currentTags.length && currentTags.length > 1) {
            score += 5
          }
        }
        
        // 3. Same difficulty level (weight: 6)
        if (currentResource?.difficulty && resource.difficulty) {
          if (resource.difficulty.toLowerCase() === currentResource.difficulty.toLowerCase()) {
            score += 6
          }
        }
        
        // 4. Same language (weight: 4)
        if (currentResource?.language && resource.language) {
          if (resource.language.toLowerCase() === currentResource.language.toLowerCase()) {
            score += 4
          }
        }
        
        // 5. Same technology (for Code resources) (weight: 10)
        if (currentCategory === 'Code' && currentResource?.technology && resource.technology) {
          if (resource.technology.toLowerCase() === currentResource.technology.toLowerCase()) {
            score += 10
          }
        }
        
        // 6. Same tool (for Template resources) (weight: 10)
        if (currentCategory === 'Template' && currentResource?.tool && resource.tool) {
          if (resource.tool.toLowerCase() === currentResource.tool.toLowerCase()) {
            score += 10
          }
        }
        
        // 7. Similar prerequisites (for Tutoriel resources) (weight: 7)
        if (currentCategory === 'Tutoriel' && currentResource?.prerequisites && resource.prerequisites) {
          const currentPrereq = currentResource.prerequisites.toLowerCase()
          const resourcePrereq = resource.prerequisites.toLowerCase()
          if (currentPrereq.includes(resourcePrereq) || resourcePrereq.includes(currentPrereq)) {
            score += 7
          }
        }
        
        // 8. Same author (weight: 3) - users might like same author's content
        if (currentResource?.author?.id && resource.author?.id) {
          if (resource.author.id === currentResource.author.id) {
            score += 3
          }
        }
        
        // 9. Title similarity (weight: 2-5) - check for common keywords
        if (currentResource?.title && resource.title) {
          const currentTitleWords = currentResource.title.toLowerCase().split(/\s+/)
          const resourceTitleWords = resource.title.toLowerCase().split(/\s+/)
          const commonWords = currentTitleWords.filter(word => 
            word.length > 3 && resourceTitleWords.includes(word)
          )
          score += commonWords.length * 1.5
        }
        
        // 10. User's viewing history relevance (weight: 2-3)
        if (userHistory.length > 0) {
          if (userHistory.includes(resource.category)) {
            score += 3
          }
          if (resource.tags) {
            const historyTags = resource.tags.filter(tag => 
              userHistory.some(h => h.toLowerCase() === tag.toLowerCase())
            )
            score += historyTags.length * 2
          }
        }
        
        // 11. Popularity boost (weight: 0.5) - less important than relevance
        const popularity = (resource.views || 0) + (resource.likes || 0) * 2
        score += Math.log(popularity + 1) * 0.5
        
        // 12. Recent resources get slight boost (weight: 1)
        const daysSinceCreation = (Date.now() - new Date(resource.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 30) {
          score += 1
        }
        
        return { ...resource, score }
      })
      
      // Sort by score and take top 6
      const topRecommendations = scoredResources
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .filter(r => r.score > 0) // Only show if has some relevance
      
      setRecommendations(topRecommendations)
      setLoading(false)
    }

    loadRecommendations()
  }, [currentResource, currentResourceId, currentCategory, currentTags, isAuthenticated, user?.id])

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

  if (loading) {
    return (
      <div className="course-recommendations">
        <h3>Recommandations de cours</h3>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des recommandations...</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="course-recommendations">
      <div className="recommendations-header">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ressources similaires
        </h3>
        <p>
          {currentResource?.title ? (
            <>Basé sur <strong>"{currentResource.title}"</strong> - ressources similaires qui pourraient vous intéresser</>
          ) : (
            <>Basé sur cette ressource - d'autres contenus similaires qui pourraient vous intéresser</>
          )}
        </p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map(resource => (
          <Link 
            key={resource.id} 
            to={`/articles/${resource.id}`}
            className="recommendation-card"
          >
            <div className="recommendation-header">
              <span className="recommendation-category">
                {getCategoryIcon(resource.category)} {resource.category}
              </span>
              {resource.difficulty && (
                <span className="recommendation-difficulty">{resource.difficulty}</span>
              )}
            </div>
            <h4>{resource.title}</h4>
            <p>{resource.excerpt || resource.content?.substring(0, 100)}...</p>
            <div className="recommendation-footer">
              <span>👁️ {resource.views || 0}</span>
              <span>❤️ {resource.likes || 0}</span>
              {resource.duration && <span>⏱️ {resource.duration}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CourseRecommendations

