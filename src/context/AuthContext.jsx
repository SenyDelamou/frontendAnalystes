import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    // Set default role if not provided
    const userWithRole = {
      ...userData,
      role: userData.role || 'user' // 'user' or 'admin'
    }
    setUser(userWithRole)
    localStorage.setItem('user', JSON.stringify(userWithRole))
    
    // Also add to users list for admin management
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const userExists = existingUsers.find(u => u.id === userWithRole.id)
    if (!userExists) {
      existingUsers.push(userWithRole)
      localStorage.setItem('users', JSON.stringify(existingUsers))
    } else {
      // Update existing user
      const updatedUsers = existingUsers.map(u => 
        u.id === userWithRole.id ? userWithRole : u
      )
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: isAdmin()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

