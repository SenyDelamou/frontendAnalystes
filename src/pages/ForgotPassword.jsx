import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Veuillez entrer votre adresse email')
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setLoading(true)

    // Simulate API call (in real app, this would be an API call)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      // In real app, you would send an email with reset link
    }, 1500)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h3>Email envoyé !</h3>
            <p>
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
            </p>
            <p className="auth-success-note">
              Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  spellCheck="false"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="exemple@email.com"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Vous vous souvenez de votre mot de passe ? <Link to="/login">Se connecter</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

