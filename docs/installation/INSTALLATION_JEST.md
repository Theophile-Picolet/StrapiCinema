# Installation et Configuration de Jest pour Strapi Cinema

##  Vue d'ensemble

Ce document décrit l'installation complète et la configuration de Jest pour les tests dans le projet Strapi Cinema.

##  Installation des dépendances

### Dépendances principales installées :

```json
{
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "@types/supertest": "^6.0.3",
    "cross-env": "^10.1.0",
    "dotenv": "^17.2.3",
    "jest": "^30.2.0",
    "supertest": "^7.1.4",
    "ts-jest": "^29.4.5"
  }
}
```

### Scripts npm ajoutés :

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "cross-env NODE_ENV=test jest --testPathPattern=api"
  }
}
```

##  Configuration Jest

### Fichier `jest.config.js` :

```javascript
module.exports = {
  preset: 'ts-jest',                    // Support TypeScript
  testEnvironment: 'node',              // Environnement Node.js
  roots: ['<rootDir>/tests'],           // Dossier des tests
  testMatch: [                          // Patterns de fichiers de test
    '**/__tests__/**/*.ts', 
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',             // Transformation TypeScript
  },
  collectCoverageFrom: [                // Fichiers à analyser pour la couverture
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',         // Dossier de rapport de couverture
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'], // Configuration globale
  testTimeout: 30000,                   // Timeout de 30 secondes
  moduleNameMapper: {                   // Alias de modules
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

##  Configuration des tests

### Fichier `tests/setup.ts` :

```typescript
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Chargement des variables d'environnement de test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Configuration simple pour les tests d'intégration
// Suppose que Strapi est déjà en cours d'exécution

let app: any;

beforeAll(async () => {
  // Récupération de l'URL Strapi depuis les variables d'environnement
  
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  app = strapiUrl;
  
  console.log(`Testing against Strapi at: ${strapiUrl}`);
}, 10000);

// Rendre l'app disponible globalement pour les tests
(globalThis as any).strapi = { server: { httpServer: app } };
```

### Fichier `.env.test` :

```bash
# Configuration de l'environnement de test
NODE_ENV=test

# URL Strapi pour les tests d'intégration (port différent pour éviter les conflits)
STRAPI_URL=http://localhost:1338

# Base de données (SQLite en mémoire pour les tests)
DATABASE_CLIENT=better-sqlite3
DATABASE_FILENAME=.tmp/test.db

# Serveur (port par défaut Strapi)
HOST=127.0.0.1
PORT=1337

# Secrets (valeurs de test)
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified

# Configuration API TMDB
TMDB_API_KEY=votre_cle_api_tmdb_ici
TMDB_BASE_URL=https://api.themoviedb.org/3
TRANSFER_TOKEN_SALT=votre_salt_transfer_token
JWT_SECRET=votre_secret_jwt
```

##  Structure des tests

```
tests/
├── api/                           # Tests d'API
│   ├── movie-schema.test.ts       # Test du schéma Movie
│   └── ...                        # Autres tests d'API
├── check-strapi.test.ts          # Test de santé de Strapi
└── setup.ts                      # Configuration globale
```

##  Types de tests implémentés

### 1. Test de santé de Strapi (`check-strapi.test.ts`)
- Vérifie la connectivité avec l'instance Strapi
- Teste l'endpoint `/api/movies`
- Accepte les codes de réponse : 200, 403, 404, 426

### 2. Test de schéma Movie (`movie-schema.test.ts`)
- **Structure de base** : kind, collectionName, info, options, attributes
- **Attributs** : validation de tous les 13 attributs requis
- **Types** : vérification des types (string, date, integer, uid)
- **Relations** : validation des relations oneToMany
- **JSON** : validation de la structure JSON
- **Données** : test d'un objet movie valide

##  Commandes disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter avec rapport de couverture
npm run test:coverage

# Exécuter uniquement les tests d'intégration
npm run test:integration

# Exécuter un test spécifique
npm test -- tests/api/movie-schema.test.ts
```

##  Couverture de code

La configuration Jest collecte la couverture de code pour :
- Tous les fichiers TypeScript dans `src/`
- Exclut les fichiers de définition (`.d.ts`)
- Exclut le point d'entrée principal (`src/index.ts`)

Rapports générés :
- **Text** : dans la console
- **LCOV** : pour les outils CI/CD
- **HTML** : rapport visuel dans `coverage/`

##  Bonnes pratiques implémentées

### Règles ESLint respectées :
- Utilisation de `node:fs` et `node:path` au lieu de `fs` et `path`
- Utilisation de `for...of` au lieu de `.forEach()`
- Import des modules Node.js avec le préfixe `node:`

### Structure des tests :
- Tests organisés par fonctionnalité
- Descriptions en français pour la clarté
- Utilisation de `describe` et `it` pour l'organisation
- Timeout approprié pour les tests d'intégration


##  Notes importantes

- Les tests d'intégration supposent que Strapi est déjà en cours d'exécution
- Utilisation de SQLite en mémoire pour les tests
- Configuration séparée avec `.env.test`
- Support complet TypeScript avec ts-jest
