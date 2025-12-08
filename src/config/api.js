// Configuration de l'API
// En développement : http://localhost:3000
// En production : URL de votre backend hébergé

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default API_URL

// Helper pour les appels API
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

