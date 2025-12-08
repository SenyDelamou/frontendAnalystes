import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PaymentModal from '../components/PaymentModal'
import PageHeader from '../components/PageHeader'
import './Donations.css'

const Donations = () => {
  const { isAuthenticated, user } = useAuth()
  const [donationAmount, setDonationAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [donationMessage, setDonationMessage] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [recentDonations, setRecentDonations] = useState([])
  const [donationStats, setDonationStats] = useState({
    total: 0,
    count: 0,
    thisMonth: 0
  })

  const presetAmounts = [
    { amount: 50000, label: '50 000 GNF', popular: false },
    { amount: 100000, label: '100 000 GNF', popular: true },
    { amount: 200000, label: '200 000 GNF', popular: false },
    { amount: 500000, label: '500 000 GNF', popular: true },
    { amount: 1000000, label: '1 000 000 GNF', popular: false }
  ]

  useEffect(() => {
    // Charger les dons récents depuis localStorage
    const stored = JSON.parse(localStorage.getItem('donations') || '[]')
    setRecentDonations(stored.slice(0, 10)) // 10 derniers dons

    // Calculer les statistiques
    const total = stored.reduce((sum, donation) => sum + (donation.amount || 0), 0)
    const thisMonth = stored.filter(d => {
      const donationDate = new Date(d.createdAt)
      const now = new Date()
      return donationDate.getMonth() === now.getMonth() && 
             donationDate.getFullYear() === now.getFullYear()
    }).reduce((sum, donation) => sum + (donation.amount || 0), 0)

    setDonationStats({
      total,
      count: stored.length,
      thisMonth
    })

    // Pré-remplir les informations si l'utilisateur est connecté
    if (isAuthenticated && user) {
      setDonorName(user.name || '')
      setDonorEmail(user.email || '')
    }
  }, [isAuthenticated, user])

  const handlePresetAmountClick = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setDonationAmount(amount.toString())
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Garder seulement les chiffres
    setCustomAmount(value)
    setSelectedAmount(null)
    setDonationAmount(value)
  }

  const handleDonate = (e) => {
    e.preventDefault()

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Veuillez sélectionner ou saisir un montant valide')
      return
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      alert('Veuillez remplir votre nom et email, ou cochez "Don anonyme"')
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentData) => {
    const amount = parseFloat(donationAmount)
    const transactionId = paymentData?.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    const donation = {
      id: Date.now(),
      amount: amount,
      currency: 'GNF',
      donorName: isAnonymous ? 'Donateur anonyme' : donorName,
      donorEmail: isAnonymous ? null : donorEmail,
      message: donationMessage,
      isAnonymous,
      transactionId,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      userId: isAuthenticated ? user?.id : null
    }

    // Sauvegarder le don
    const donations = JSON.parse(localStorage.getItem('donations') || '[]')
    donations.unshift(donation)
    localStorage.setItem('donations', JSON.stringify(donations))

    // Mettre à jour les statistiques
    setDonationStats(prev => ({
      total: prev.total + amount,
      count: prev.count + 1,
      thisMonth: prev.thisMonth + amount
    }))

    // Ajouter aux dons récents
    setRecentDonations(prev => [donation, ...prev.slice(0, 9)])

    // Réinitialiser le formulaire
    setDonationAmount('')
    setSelectedAmount(null)
    setCustomAmount('')
    setDonationMessage('')
    setShowPaymentModal(false)

    alert(`Merci pour votre don de ${amount.toLocaleString('fr-GN')} GNF ! Votre générosité contribue au développement de la communauté.`)
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
  }

  const formatAmount = (amount) => {
    return amount.toLocaleString('fr-GN')
  }

  return (
    <div className="donations-page">
      <PageHeader
        title="Faire un Don"
        subtitle="Votre générosité contribue au développement et à la pérennité de notre communauté"
        imageUrls={[
          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80',
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80'
        ]}
      />
      <div className="container">
        <div className="donations-content">
          {/* Section principale - Formulaire de don */}
          <div className="donation-form-section">
            <div className="donation-form-card card">
              <div className="donation-header">
                <h2>💝 Faire un don</h2>
                <p className="donation-subtitle">
                  Chaque contribution, grande ou petite, nous aide à maintenir et améliorer la plateforme
                </p>
              </div>

              <form onSubmit={handleDonate} className="donation-form">
                {/* Montants prédéfinis */}
                <div className="form-group">
                  <label>Montant du don *</label>
                  <div className="preset-amounts">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset.amount}
                        type="button"
                        className={`preset-amount-btn ${selectedAmount === preset.amount ? 'active' : ''} ${preset.popular ? 'popular' : ''}`}
                        onClick={() => handlePresetAmountClick(preset.amount)}
                      >
                        {preset.label}
                        {preset.popular && <span className="popular-badge">Populaire</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Montant personnalisé */}
                <div className="form-group">
                  <label>Ou montant personnalisé</label>
                  <div className="custom-amount-input">
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Entrez un montant"
                      className="amount-input"
                    />
                    <span className="currency">GNF</span>
                  </div>
                  {donationAmount && (
                    <div className="amount-preview">
                      Montant sélectionné : <strong>{formatAmount(parseFloat(donationAmount) || 0)} GNF</strong>
                    </div>
                  )}
                </div>

                {/* Informations du donateur */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">Faire un don anonyme</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="donor-info-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom complet *</label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          required={!isAnonymous}
                          placeholder="Votre nom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          required={!isAnonymous}
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Message optionnel */}
                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    rows="4"
                    placeholder="Laissez un message de soutien à la communauté..."
                    maxLength={500}
                  />
                  <div className="char-count">{donationMessage.length}/500</div>
                </div>

                {/* Bouton de don */}
                <div className="donation-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-large btn-donate"
                    disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                  >
                    <span>💝</span>
                    Faire un don de {donationAmount ? formatAmount(parseFloat(donationAmount)) : '0'} GNF
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Section latérale - Statistiques et dons récents */}
          <div className="donations-sidebar">
            {/* Statistiques */}
            <div className="stats-card card">
              <h3>📊 Statistiques des dons</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{formatAmount(donationStats.total)}</div>
                  <div className="stat-label">Total collecté</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{donationStats.count}</div>
                  <div className="stat-label">Nombre de dons</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatAmount(donationStats.thisMonth)}</div>
                  <div className="stat-label">Ce mois-ci</div>
                </div>
              </div>
            </div>

            {/* Dons récents */}
            {recentDonations.length > 0 && (
              <div className="recent-donations-card card">
                <h3>🌟 Dons récents</h3>
                <div className="recent-donations-list">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="recent-donation-item">
                      <div className="donation-amount">{formatAmount(donation.amount)} GNF</div>
                      <div className="donation-info">
                        <div className="donation-donor">{donation.donorName}</div>
                        <div className="donation-date">
                          {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      {donation.message && (
                        <div className="donation-message">"{donation.message.substring(0, 50)}..."</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations */}
            <div className="info-card card">
              <h3>ℹ️ À propos des dons</h3>
              <ul className="info-list">
                <li>Les dons sont utilisés pour maintenir et améliorer la plateforme</li>
                <li>Vous recevrez un reçu de confirmation par email</li>
                <li>Les dons peuvent être anonymes si vous le souhaitez</li>
                <li>Tous les paiements sont sécurisés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        amount={parseFloat(donationAmount) || 0}
        currency="GNF"
      />
    </div>
  )
}

export default Donations

