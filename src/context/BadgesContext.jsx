import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const BadgesContext = createContext()

export const useBadges = () => {
  const context = useContext(BadgesContext)
  if (!context) {
    throw new Error('useBadges must be used within a BadgesProvider')
  }
  return context
}

export const BadgesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [badges, setBadges] = useState([])
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setBadges([])
      setAchievements([])
      return
    }

    const checkBadges = () => {
      const userBadges = []
      const userAchievements = []

      // Get user stats
      const articles = JSON.parse(localStorage.getItem('articles') || '[]')
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
      const topics = JSON.parse(localStorage.getItem('topics') || '[]')
      
      const userArticles = articles.filter(a => a.author?.id === user.id)
      const userProjects = projects.filter(p => p.owner?.id === user.id)
      const userTopics = topics.filter(t => t.author?.id === user.id)

      // Badge: First Resource
      if (userArticles.length >= 1) {
        userBadges.push({
          id: 'first_resource',
          name: 'Première Ressource',
          description: 'Partagez votre première ressource',
          icon: '📚',
          unlocked: true,
          unlockedAt: userArticles[0]?.createdAt
        })
      }

      // Badge: Resource Master
      if (userArticles.length >= 10) {
        userBadges.push({
          id: 'resource_master',
          name: 'Maître des Ressources',
          description: 'Partagez 10 ressources',
          icon: '📖',
          unlocked: true,
          unlockedAt: userArticles[9]?.createdAt
        })
      }

      // Badge: Project Creator
      if (userProjects.length >= 1) {
        userBadges.push({
          id: 'project_creator',
          name: 'Créateur de Projet',
          description: 'Créez votre premier projet',
          icon: '💼',
          unlocked: true,
          unlockedAt: userProjects[0]?.createdAt
        })
      }

      // Badge: Community Contributor
      if (userTopics.length >= 5) {
        userBadges.push({
          id: 'community_contributor',
          name: 'Contributeur Communautaire',
          description: 'Créez 5 sujets de discussion',
          icon: '💬',
          unlocked: true,
          unlockedAt: userTopics[4]?.createdAt
        })
      }

      // Badge: Active Member
      const joinedDate = new Date(user.joinedAt || Date.now())
      const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceJoined >= 30) {
        userBadges.push({
          id: 'active_member',
          name: 'Membre Actif',
          description: 'Membre depuis 30 jours',
          icon: '⭐',
          unlocked: true,
          unlockedAt: new Date(joinedDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      }

      // Achievement: Power User
      const totalContributions = userArticles.length + userProjects.length + userTopics.length
      if (totalContributions >= 20) {
        userAchievements.push({
          id: 'power_user',
          name: 'Utilisateur Puissant',
          description: '20 contributions totales',
          icon: '🔥',
          unlocked: true,
          unlockedAt: new Date().toISOString()
        })
      }

      // Achievement: Expert
      if (userArticles.length >= 5 && userProjects.length >= 2) {
        userAchievements.push({
          id: 'expert',
          name: 'Expert',
          description: '5 ressources et 2 projets',
          icon: '🎓',
          unlocked: true,
          unlockedAt: new Date().toISOString()
        })
      }

      setBadges(userBadges)
      setAchievements(userAchievements)

      // Save to localStorage
      const key = `badges_${user.id}`
      localStorage.setItem(key, JSON.stringify({ badges: userBadges, achievements: userAchievements }))
    }

    checkBadges()
  }, [isAuthenticated, user?.id, user?.joinedAt])

  const getTotalBadges = () => badges.length
  const getTotalAchievements = () => achievements.length

  return (
    <BadgesContext.Provider value={{
      badges,
      achievements,
      getTotalBadges,
      getTotalAchievements
    }}>
      {children}
    </BadgesContext.Provider>
  )
}

