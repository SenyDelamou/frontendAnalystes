import { useState, useEffect } from 'react'
import './SplashScreen.css'

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Animation de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Masquer le splash screen après 2.5 secondes
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onFinish()
      }, 500) // Délai pour l'animation de sortie
    }, 2500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [onFinish])

  return (
    <div className={`splash-screen ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="splash-text">
          <h1 className="splash-title">Data Analysts</h1>
          <p className="splash-subtitle">GUINÉE</p>
        </div>
        <div className="splash-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="splash-loading-text">
          <span className="loading-dot">●</span>
          <span className="loading-dot">●</span>
          <span className="loading-dot">●</span>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen

