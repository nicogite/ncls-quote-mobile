# The Quote Mobile 📱

Application mobile hybride (iOS/Android) pour recevoir et noter des citations quotidiennes inspirantes.

## 🚀 Technologies

- **Framework**: [Ionic](https://ionicframework.com/) v8 + [Vue 3](https://vuejs.org/)
- **Mobile**: [Capacitor](https://capacitorjs.com/) v8
- **Langage**: TypeScript
- **Build**: Vite
- **Tests**: Vitest + Cypress
- **Styling**: CSS Variables Ionic

## 📦 Prérequis

- Node.js >= 18.x
- npm >= 9.x
- Pour iOS: Xcode + CocoaPods
- Pour Android: Android Studio + SDK

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Synchroniser avec Capacitor
npx cap sync
```

## 🚀 Développement

```bash
# Démarrer le serveur de développement (navigateur)
npm run dev

# Ouvrir dans iOS Simulator
npx cap open ios

# Ouvrir dans Android Studio
npx cap open android

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests E2E
npm run test:e2e

# Lint
npm run lint
```

## 📱 Fonctionnalités

### ✨ Citation du jour
- Récupération d'une citation aléatoire depuis l'API
- Citations non répétitives par appareil
- Affichage élégant avec auteur

### ⭐ Notation
- Système de notation de 1 à 5 étoiles
- Feedback visuel interactif
- Sauvegarde des notes sur le serveur

### 🔧 Actions
- **J'aime**: Navigation vers la page de notation
- **Partager**: Partage natif iOS/Android (SMS, WhatsApp, Email, etc.)

### 📄 Pages informatives
- Bienvenue
- Le concept
- Contact
- CGU
- Inscription

## 🏗️ Structure du projet

```
quote-mobile/
├── src/
│   ├── views/              # Pages de l'application
│   │   ├── QuoteView.vue   # Citation du jour
│   │   ├── NotationView.vue # Notation des citations
│   │   ├── WelcomeView.vue # Page d'accueil
│   │   └── ...
│   ├── components/         # Composants réutilisables
│   ├── router/            # Configuration des routes
│   ├── services/          # Services (API, Device)
│   │   ├── api.ts         # Client Axios
│   │   └── deviceService.ts # Gestion ID appareil
│   ├── theme/             # Variables CSS
│   └── App.vue            # Composant racine
├── public/                # Fichiers statiques
├── tests/                 # Tests E2E et unitaires
├── capacitor.config.ts    # Config Capacitor
└── vite.config.ts         # Config Vite

```

## 🔌 API Backend

L'application communique avec l'API REST située dans `/quote-api`.

### Endpoints utilisés

- `GET /api/quoteoftheday?deviceId={uuid}&geolocalisation={code}` - Citation du jour
- `POST /api/ratings` - Enregistrer une notation

### Configuration

Les URLs de l'API sont configurées dans les fichiers d'environnement :
- `.env.development` - Développement local
- `.env.production` - Production

## 📦 Packages Capacitor

- `@capacitor/app` - Gestion du cycle de vie de l'app
- `@capacitor/clipboard` - Copie dans le presse-papier
- `@capacitor/share` - Partage natif
- `@capacitor/preferences` - Stockage local
- `@capacitor/haptics` - Retours haptiques
- `@capacitor/keyboard` - Gestion du clavier
- `@capacitor/status-bar` - Configuration de la barre d'état

## 🔑 Identifiant appareil

L'application génère un UUID unique par appareil via `deviceService.ts` :
- Stocké dans `Preferences` (localStorage natif)
- Utilisé pour tracker les citations vues
- Permet la personnalisation de l'expérience

## 🎨 Thème

Le thème est personnalisable via les variables CSS dans `src/theme/variables.css` :
- Mode clair/sombre automatique
- Couleurs Ionic personnalisables
- Polices custom dans `src/assets/fonts/`

## 🚢 Déploiement

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
# Puis build dans Xcode
```

### Android
```bash
npm run build
npx cap sync android
npx cap open android
# Puis build dans Android Studio
```

## 📝 Licence

Projet privé - Tous droits réservés

## 👤 Auteur

Nicolas - [nicogite](https://github.com/nicogite)

## 🤝 Contribution

Projet privé - Contributions non acceptées pour le moment
