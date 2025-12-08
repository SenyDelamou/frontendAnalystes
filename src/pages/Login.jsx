import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Load saved credentials if "remember me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }))
    }
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    // Simulate login (in real app, this would be an API call)
    // Check if admin email (for demo purposes)
    const isAdminEmail = formData.email.toLowerCase().includes('admin') || formData.email === 'admin@dataanalysts.gn'
    // Try to find existing user
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = existingUsers.find(u => u.email === formData.email)
    
    const userData = existingUser || {
      id: Date.now(),
      name: formData.email.split('@')[0],
      email: formData.email,
      avatar: null,
      bio: '',
      role: isAdminEmail ? 'admin' : 'user',
      expertiseLevel: 'Débutant',
      joinedAt: new Date().toISOString()
    }

    // Save credentials if "remember me" is checked
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email)
      localStorage.setItem('rememberedPassword', formData.password)
    } else {
      // Remove saved credentials if unchecked
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
    }

    login(userData)
    navigate('/dashboard')
  }

  const handleGoogleLogin = () => {
    setError('')
    // Simulate Google login (in real app, this would use Google OAuth)
    // Try to find existing user
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = existingUsers.find(u => u.email === 'user@gmail.com')
    
    const userData = existingUser || {
      id: Date.now(),
      name: 'Utilisateur Google',
      email: 'user@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=667eea&color=fff',
      bio: '',
      expertiseLevel: 'Débutant',
      joinedAt: new Date().toISOString()
    }

    login(userData)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-google"
        >
          <span className="btn-google-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </span>
          <span>Continuer avec Google</span>
        </button>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              inputMode="email"
              spellCheck="false"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="exemple@email.com"
            />
          </div>

          <div className="form-group">
            <div className="form-group-header">
              <label htmlFor="password">Mot de passe</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Se souvenir de moi</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Se connecter
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

