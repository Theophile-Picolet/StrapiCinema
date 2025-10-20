# Modifications du workflow GitHub Actions

Date: 20 octobre 2025

## Ce quej'ai fait

### 1) Pipeline GitHub Actions

Fichier créé: `.github/workflows/ci.yml`

Avant, on devait tester manuellement à chaque modification. Maintenant, GitHub teste automatiquement le code à chaque push.

**Comment ça marche :**
Le workflow se déclenche sur:
- `push` sur toutes les branches sauf `main`
- `pull_request` vers la branche `dev`

**Étapes du pipeline :**
1. **Checkout du code** - Récupère le code du repository
2. **Installation Node.js 20** - Configure l'environnement
3. **Cache npm** - Sauvegarde les dépendances pour aller plus vite la prochaine fois
4. **`npm ci`** - Installe les dépendances (plus rapide que `npm install`)
5. **Cache Strapi build** - Sauvegarde les fichiers de build de Strapi
6. **Vérification TypeScript** - Vérifie que le code TypeScript compile sans erreur
7. **Linting** - Vérifie que le code respecte les règles de style
8. **Build du projet** - Compile Strapi pour vérifier que tout fonctionne

### 2) Badges dans le README

Fichier modifié: `README.md`

 Pour que tout le monde puisse voir d'un coup d'œil si le projet fonctionne bien.

**Ce qu'on a ajouté :**
- **Badge CI** - Affiche si le pipeline GitHub Actions passe (vert) ou échoue (rouge)
- **Badge Node.js >= 20** - Indique la version Node.js requise
- **Badge Strapi v4** - Indique la version de Strapi utilisée
- **Badge Build Status** - Affiche l'état général du build

### 3) Améliorations du workflow

**Cache Strapi :** On sauvegarde les fichiers `.cache` et `build` pour que le build soit plus rapide la prochaine fois.

**Vérification TypeScript :** On vérifie que le code TypeScript compile avant de faire le build complet.

**Linting automatique :** On vérifie que le code respecte les règles de style (indentation, etc.).

**Cache npm optimisé :** On sauvegarde les dépendances npm pour les réutiliser.

---

## Résultat

**Avant :** On devait tester manuellement à chaque modification, et on ne savait pas si le code était bon.

**Maintenant :** 
- Le pipeline teste automatiquement le code à chaque push
- On voit immédiatement si ça marche ou pas (badges verts/rouges)
- Le build est plus rapide grâce au cache
- On détecte les erreurs de code avant qu'elles posent problème



**Visibilité :** Le README affiche le statut en temps réel, tout le monde peut voir si le projet fonctionne.

