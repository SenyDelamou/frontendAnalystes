# Frontend - Data Analysts Guinée

Application React pour la plateforme communautaire des data analysts de Guinée.

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3001`

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Prévisualisation du build

```bash
npm run preview
```

## 📁 Structure

```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── context/        # Contextes React (Auth, Theme, etc.)
│   ├── config/         # Configuration (API, Navbar)
│   ├── styles/         # Styles globaux
│   └── main.jsx        # Point d'entrée
├── index.html          # Template HTML
└── vite.config.js      # Configuration Vite
```

## 🛠️ Technologies

- **React 18** - Bibliothèque UI
- **React Router** - Routage
- **Vite** - Build tool et dev server
- **CSS3** - Styles avec animations

## 📝 Scripts

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée un build de production
- `npm run preview` - Prévisualise le build de production

## 🔗 API Backend

Le frontend communique avec le backend via l'API configurée dans `src/config/api.js`.

Par défaut, l'API backend est attendue sur `http://localhost:3000`

