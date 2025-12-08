import { useState } from 'react'
import './PaymentModal.css'

const PaymentModal = ({ isOpen, onClose, onSuccess, amount = 20000, currency = 'GNF' }) => {
  const [paymentMethod, setPaymentMethod] = useState('mobile-money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    // Validation
    if (paymentMethod === 'mobile-money' && !phoneNumber.trim()) {
      setError('Veuillez entrer votre numéro de téléphone')
      setIsProcessing(false)
      return
    }

    if (paymentMethod === 'mobile-money' && phoneNumber.length < 9) {
      setError('Numéro de téléphone invalide')
      setIsProcessing(false)
      return
    }

    try {
      // Simuler le paiement (dans la vraie app, ceci appellerait l'API de paiement)
      await simulatePayment(paymentMethod, phoneNumber)
      
      // Succès
      setTimeout(() => {
        setIsProcessing(false)
        onSuccess({
          method: paymentMethod,
          amount: amount,
          currency: currency,
          transactionId: generateTransactionId(),
          timestamp: new Date().toISOString()
        })
      }, 2000)
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement. Veuillez réessayer.')
      setIsProcessing(false)
    }
  }

  const simulatePayment = (method, phone) => {
    return new Promise((resolve, reject) => {
      // Simuler un délai de traitement
      setTimeout(() => {
        // Simuler un échec aléatoire (10% de chance) pour la démo
        if (Math.random() < 0.1) {
          reject(new Error('Paiement échoué. Vérifiez votre solde ou réessayez plus tard.'))
        } else {
          resolve({
            success: true,
            transactionId: generateTransactionId()
          })
        }
      }, 2000)
    })
  }

  const generateTransactionId = () => {
    return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Paiement de la prime d'adhésion</h2>
          <button className="payment-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="payment-modal-content">
          <div className="payment-amount-display">
            <div className="payment-amount-label">Montant à payer</div>
            <div className="payment-amount-value">{formatAmount(amount)}</div>
            <div className="payment-amount-note">
              Prime d'adhésion unique pour accéder à la plateforme
            </div>
          </div>

          <form onSubmit={handlePayment} className="payment-form">
            <div className="payment-methods">
              <label className="payment-method-label">Méthode de paiement</label>
              
              <div className="payment-method-options">
                <label className={`payment-method-option ${paymentMethod === 'mobile-money' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile-money"
                    checked={paymentMethod === 'mobile-money'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-icon">📱</div>
                    <div>
                      <div className="payment-method-name">Mobile Money</div>
                      <div className="payment-method-desc">Orange Money / MTN Mobile Money</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-method-option ${paymentMethod === 'stripe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-icon">💳</div>
                    <div>
                      <div className="payment-method-name">Carte bancaire</div>
                      <div className="payment-method-desc">Visa, Mastercard, etc.</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'mobile-money' && (
              <div className="form-group">
                <label htmlFor="phoneNumber">
                  Numéro de téléphone Mobile Money
                </label>
                <div className="phone-input-wrapper">
                  <select className="phone-prefix">
                    <option value="+224">+224 (Guinée)</option>
                  </select>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="6XX XXX XXX"
                    maxLength="9"
                    required
                  />
                </div>
                <small className="form-hint">
                  Entrez votre numéro Orange Money ou MTN Mobile Money
                </small>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div className="stripe-info">
                <div className="stripe-note">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Vous serez redirigé vers une page de paiement sécurisée</span>
                </div>
              </div>
            )}

            {error && (
              <div className="payment-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <div className="payment-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Traitement en cours...
                  </>
                ) : (
                  `Payer ${formatAmount(amount)}`
                )}
              </button>
            </div>
          </form>

          <div className="payment-security">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Paiement sécurisé et crypté</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal

