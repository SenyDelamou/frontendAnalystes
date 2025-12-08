import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Footer.css'

const Footer = () => {
  const { isAdmin } = useAuth()
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Data Analysts Guinée</h3>
          <p>La plateforme où les data analysts guinéens se rencontrent, collaborent et grandissent ensemble.</p>
        </div>
        
        <div className="footer-section">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/articles">Ressources</Link></li>
            <li><Link to="/projects">Projets</Link></li>
            <li><Link to="/coaching">Coaching</Link></li>
            <li><Link to="/challenges">Défis</Link></li>
            <li><Link to="/forum">Forum</Link></li>
            <li><Link to="/profiles">Membres</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Actions</h4>
          <ul>
            <li><Link to="/articles/create">Partager une ressource</Link></li>
            {isAdmin && (
              <>
                <li><Link to="/projects/create">Créer un projet</Link></li>
                <li><Link to="/challenges/create">Lancer un défi</Link></li>
                <li><Link to="/forum/create">Créer un sujet</Link></li>
              </>
            )}
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <div className="footer-contact">
            <a 
              href="mailto:samakedelamou858@gmail.com" 
              className="footer-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              samakedelamou858@gmail.com
            </a>
            <a 
              href="https://wa.me/224629403019" 
              className="footer-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.4a8.48 8.48 0 0 1 8 8v.4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              +224 629 403 019
            </a>
          </div>
          <p>Communauté des Data Analysts de Guinée</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Data Analysts Guinée. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

export default Footer

