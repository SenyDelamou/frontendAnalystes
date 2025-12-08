import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien')
      return
    }

    setLoading(true)

    // Simulate API call (in real app, this would be an API call)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Modifier le mot de passe</h1>
          <p>Changez votre mot de passe pour sécuriser votre compte</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h3>Mot de passe modifié !</h3>
            <p>Votre mot de passe a été modifié avec succès.</p>
            <p className="auth-success-note">Vous allez être redirigé vers votre tableau de bord...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Mot de passe actuel</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Entrez votre mot de passe actuel"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="Minimum 8 caractères"
                disabled={loading}
              />
              <small className="form-hint">
                Le mot de passe doit contenir au moins 8 caractères
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Répétez le nouveau mot de passe"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/dashboard">← Retour au tableau de bord</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword

