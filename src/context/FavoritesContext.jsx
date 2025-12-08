import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState({
    resources: [],
    projects: [],
    challenges: []
  })

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const stored = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '{"resources":[],"projects":[],"challenges":[]}')
      setFavorites(stored)
    } else {
      setFavorites({ resources: [], projects: [], challenges: [] })
    }
  }, [isAuthenticated, user?.id])

  const addFavorite = (type, itemId) => {
    if (!isAuthenticated || !user?.id) return false
    
    const key = `favorites_${user.id}`
    const stored = JSON.parse(localStorage.getItem(key) || '{"resources":[],"projects":[],"challenges":[]}')
    
    if (!stored[type].includes(itemId)) {
      stored[type].push(itemId)
      localStorage.setItem(key, JSON.stringify(stored))
      setFavorites(stored)
      return true
    }
    return false
  }

  const removeFavorite = (type, itemId) => {
    if (!isAuthenticated || !user?.id) return false
    
    const key = `favorites_${user.id}`
    const stored = JSON.parse(localStorage.getItem(key) || '{"resources":[],"projects":[],"challenges":[]}')
    
    stored[type] = stored[type].filter(id => id !== itemId)
    localStorage.setItem(key, JSON.stringify(stored))
    setFavorites(stored)
    return true
  }

  const toggleFavorite = (type, itemId) => {
    if (isFavorite(type, itemId)) {
      return removeFavorite(type, itemId)
    } else {
      return addFavorite(type, itemId)
    }
  }

  const isFavorite = (type, itemId) => {
    if (!isAuthenticated || !user?.id) return false
    return favorites[type]?.includes(itemId) || false
  }

  const getFavoritesCount = () => {
    return (favorites.resources?.length || 0) + 
           (favorites.projects?.length || 0) + 
           (favorites.challenges?.length || 0)
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      getFavoritesCount
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

