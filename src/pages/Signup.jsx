import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ExpertiseQuestionnaire from '../components/ExpertiseQuestionnaire'
import PaymentModal from '../components/PaymentModal'
import './Auth.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    expertiseLevel: ''
  })
  const [error, setError] = useState('')
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(null)
  const [pendingExpertiseLevel, setPendingExpertiseLevel] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Montant de la prime d'adhésion en GNF
  const MEMBERSHIP_FEE = 20000

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If expertise level is being changed to Intermédiaire, Avancé, or Expert
    if (name === 'expertiseLevel' && 
        (value === 'Intermédiaire' || value === 'Avancé' || value === 'Expert')) {
      setPendingExpertiseLevel(value)
      setShowQuestionnaire(true)
      // Don't update formData yet, wait for questionnaire completion
      return
    }
    
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleQuestionnaireComplete = (answers) => {
    setQuestionnaireAnswers(answers)
    setFormData({
      ...formData,
      expertiseLevel: pendingExpertiseLevel
    })
    setShowQuestionnaire(false)
    setPendingExpertiseLevel('')
  }

  const handleQuestionnaireCancel = () => {
    setShowQuestionnaire(false)
    setPendingExpertiseLevel('')
    setFormData({
      ...formData,
      expertiseLevel: ''
    })
    // Reset select to empty
    const select = document.getElementById('expertiseLevel')
    if (select) select.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (!formData.expertiseLevel) {
      setError('Veuillez sélectionner votre niveau d\'expertise')
      return
    }

    // Ouvrir le modal de paiement avant de créer le compte
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentInfo) => {
    setPaymentData(paymentInfo)
    setShowPaymentModal(false)
    
    // Maintenant créer le compte après paiement réussi
    createUserAccount(paymentInfo)
  }

  const createUserAccount = (paymentInfo) => {
    // Check if admin email (for demo purposes)
    const isAdminEmail = formData.email.toLowerCase().includes('admin') || formData.email === 'admin@dataanalysts.gn'
    const userData = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      avatar: null,
      bio: '',
      role: isAdminEmail ? 'admin' : 'user',
      expertiseLevel: formData.expertiseLevel || 'Débutant',
      questionnaireAnswers: questionnaireAnswers || null,
      joinedAt: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentData: paymentInfo,
      membershipFee: MEMBERSHIP_FEE,
      membershipDate: new Date().toISOString()
    }

    // Sauvegarder les données de paiement dans localStorage (pour la démo)
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    payments.push({
      userId: userData.id,
      ...paymentInfo,
      userEmail: formData.email,
      userName: formData.name
    })
    localStorage.setItem('payments', JSON.stringify(payments))

    login(userData)
    navigate('/dashboard')
  }

  const handleGoogleSignup = () => {
    setError('')
    // Pour Google Signup, on doit aussi payer la prime d'adhésion
    // Note: Dans une vraie app, on récupérerait les données Google d'abord
    // Pour la démo, on simule directement le paiement puis la création du compte
    setShowPaymentModal(true)
  }

  const handleGooglePaymentSuccess = (paymentInfo) => {
    setPaymentData(paymentInfo)
    setShowPaymentModal(false)
    
    // Créer le compte Google après paiement
    const userData = {
      id: Date.now(),
      name: 'Utilisateur Google',
      email: 'user@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=667eea&color=fff',
      bio: '',
      expertiseLevel: 'Débutant',
      joinedAt: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentData: paymentInfo,
      membershipFee: MEMBERSHIP_FEE,
      membershipDate: new Date().toISOString()
    }

    // Sauvegarder les données de paiement
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    payments.push({
      userId: userData.id,
      ...paymentInfo,
      userEmail: userData.email,
      userName: userData.name
    })
    localStorage.setItem('payments', JSON.stringify(payments))

    login(userData)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Rejoignez la communauté</h1>
          <p>Créez votre compte et connectez-vous avec les data analysts de Guinée</p>
          <div className="membership-fee-badge">
            <span className="fee-icon">💰</span>
            <span>Prime d'adhésion : <strong>20,000 GNF</strong> (unique)</span>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignup}
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
          <span>S'inscrire avec Google</span>
        </button>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              autoCapitalize="words"
              spellCheck="true"
              placeholder="Jean Dupont"
            />
          </div>

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
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="Minimum 8 caractères"
            />
            <small className="form-hint">
              Le mot de passe doit contenir au moins 8 caractères
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Répétez le mot de passe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="expertiseLevel">
              Niveau d'expertise *
              <span className="label-info">(Peut être modifié plus tard)</span>
            </label>
            <select
              id="expertiseLevel"
              name="expertiseLevel"
              value={formData.expertiseLevel}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez votre niveau</option>
              <option value="Débutant">🌱 Débutant - Je commence en analyse de données</option>
              <option value="Intermédiaire">📈 Intermédiaire - J'ai des bases solides</option>
              <option value="Avancé">🚀 Avancé - Je maîtrise plusieurs outils et techniques</option>
              <option value="Expert">⭐ Expert - Je peux former et coacher d'autres personnes</option>
            </select>
            <small className="form-hint">
              💡 Les membres "Avancé" et "Expert" apparaîtront automatiquement sur la page Coaching comme mentors disponibles
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Créer mon compte
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>

      {showQuestionnaire && pendingExpertiseLevel && (
        <ExpertiseQuestionnaire
          expertiseLevel={pendingExpertiseLevel}
          onComplete={handleQuestionnaireComplete}
          onCancel={handleQuestionnaireCancel}
        />
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          // Si l'utilisateur annule le paiement Google, on ne fait rien
        }}
        onSuccess={(paymentInfo) => {
          // Vérifier si c'est un paiement Google ou normal
          if (formData.email) {
            handlePaymentSuccess(paymentInfo)
          } else {
            handleGooglePaymentSuccess(paymentInfo)
          }
        }}
        amount={MEMBERSHIP_FEE}
        currency="GNF"
      />
    </div>
  )
}

export default Signup

