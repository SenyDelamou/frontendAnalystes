/**
 * Configuration flexible pour les liens de navigation
 * Ajoutez ou modifiez les liens ici pour qu'ils s'affichent automatiquement dans la navbar
 * 
 * PROPRIÉTÉS DISPONIBLES:
 * - path: chemin de la route
 * - label: texte affiché
 * - requiresAuth: true si l'utilisateur doit être connecté
 * - showInMobile: true pour afficher dans le menu mobile
 * - icon: (optionnel) composant SVG ou nom d'icône
 * - badge: (optionnel) badge à afficher (ex: "Nouveau")
 * - className: (optionnel) classe CSS personnalisée
 */

export const navbarLinks = [
  {
    path: '/',
    label: 'Accueil',
    requiresAuth: false,
    showInMobile: true
  },
  {
    path: '/articles',
    label: 'Ressources',
    requiresAuth: false,
    showInMobile: true
  },
  {
    path: '/projects',
    label: 'Projets',
    requiresAuth: false,
    showInMobile: true
  },
  {
    path: '/coaching',
    label: 'Coaching',
    requiresAuth: false,
    showInMobile: true
  },
  {
    path: '/challenges',
    label: 'Défis',
    requiresAuth: false,
    showInMobile: true
  },
  {
    path: '/donations',
    label: 'Dons',
    requiresAuth: false,
    showInMobile: true,
    icon: '💝'
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    requiresAuth: true,
    showInMobile: true
  }
]

/**
 * Configuration pour les boutons d'action dans la navbar
 * Ces boutons s'affichent dans la section "navbar-actions"
 * 
 * PROPRIÉTÉS DISPONIBLES:
 * - type: 'link' | 'button' | 'custom'
 * - label: texte du bouton
 * - path: (pour type='link') chemin de la route
 * - onClick: (pour type='button') fonction à exécuter
 * - requiresAuth: true si l'utilisateur doit être connecté
 * - showWhenAuthenticated: true pour afficher seulement si connecté
 * - showWhenNotAuthenticated: true pour afficher seulement si non connecté
 * - icon: (optionnel) composant SVG ou nom d'icône
 * - className: (optionnel) classe CSS personnalisée
 * - badge: (optionnel) badge à afficher
 * - component: (pour type='custom') composant React personnalisé
 */
export const navbarActionButtons = [
  // Exemple: Bouton de connexion (affiché seulement si non connecté)
  {
    type: 'link',
    label: 'Connexion',
    path: '/login',
    showWhenNotAuthenticated: true,
    className: 'navbar-action-btn navbar-action-btn-primary'
  }
  // Ajoutez d'autres boutons ici pour qu'ils s'affichent automatiquement
  // Exemple:
  // {
  //   type: 'link',
  //   label: 'Contact',
  //   path: '/contact',
  //   requiresAuth: false,
  //   className: 'navbar-action-btn'
  // }
]

/**
 * Fonction utilitaire pour obtenir les liens filtrés selon l'état d'authentification
 */
export const getFilteredNavbarLinks = (isAuthenticated) => {
  return navbarLinks.filter(link => {
    if (link.requiresAuth && !isAuthenticated) {
      return false
    }
    return true
  })
}

/**
 * Fonction pour obtenir les liens pour le menu mobile
 */
export const getMobileNavbarLinks = (isAuthenticated) => {
  return navbarLinks.filter(link => {
    if (link.requiresAuth && !isAuthenticated) {
      return false
    }
    return link.showInMobile !== false
  })
}

/**
 * Fonction pour obtenir les boutons d'action filtrés selon l'état d'authentification
 */
export const getFilteredActionButtons = (isAuthenticated) => {
  return navbarActionButtons.filter(button => {
    // Filtrer selon l'authentification
    if (button.requiresAuth && !isAuthenticated) {
      return false
    }
    if (button.showWhenAuthenticated && !isAuthenticated) {
      return false
    }
    if (button.showWhenNotAuthenticated && isAuthenticated) {
      return false
    }
    return true
  })
}

