#  Guide d'installation - CineVerse API

## Prérequis

### Logiciels requis

- **Node.js** : Version 18 ou supérieure
  ```bash
  node --version  # Vérifier la version
  ```
- **npm** ou **yarn** : Gestionnaire de paquets
- **Git** : Pour cloner le repository

### Clé API TMDb

1. Créer un compte sur [The Movie Database (TMDb)](https://www.themoviedb.org/)
2. Aller dans **Settings** → **API**
3. Demander une clé API (gratuite)
4. Noter la clé pour la configuration

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Theophile-Picolet/StrapiCinema.git
cd StrapiCinema
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
nano .env  # ou votre éditeur préféré
```

#### Variables à configurer dans `.env`

```env
# Base de données
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Serveur
HOST=0.0.0.0
PORT=1337

# API TMDb
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# Sécurité
JWT_SECRET=your_jwt_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here

# Environnement
NODE_ENV=development
```

### 4. Initialisation de la base de données

```bash
# Première exécution (création des tables)
npm run develop
```


### 5. Création du compte administrateur

1. Ouvrir `http://localhost:1337/admin`
2. Remplir le formulaire d'inscription admin :
   - **Prénom** : Votre prénom
   - **Nom** : Votre nom
   - **Email** : admin@admin.com
   - **Mot de passe** : Choisir un mot de passe sécurisé
3. Cliquer sur **"Let's start"**

## Démarrage

### Mode développement

```bash
npm run develop
```

**Fonctionnalités :**
- Auto-reload lors des modifications
- Interface admin accessible
- API disponible sur `http://localhost:1337/api`

### Mode production

```bash
npm run build
npm run start
```

## Vérification de l'installation

### 1. Interface admin

- URL : `http://localhost:1337/admin`
- Se connecter avec le compte admin créé
- Vérifier que les modèles **Movie** et **Actor** sont visibles

### 2. API endpoints

```bash
# Test de l'API
curl http://localhost:1337/api/movies
curl http://localhost:1337/api/actors
```