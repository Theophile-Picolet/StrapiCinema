# Amélioration du workflow CI - Bonnes pratiques

Date: 21 octobre 2025

## Problème identifié

Dans le workflow CI (`.github/workflows/ci.yml`), il y avait une étape problématique :

```yaml
- name: Auto fix lint issues
  run: npm run lint:fix
```

## Pourquoi c'est problématique ?

### 1. **Modifications non commitées**
- `lint:fix` modifie automatiquement les fichiers pour corriger les erreurs de style
- En CI, ces modifications ne peuvent pas être commitées automatiquement
- Cela crée des différences entre le code local et le code en CI

### 2. **Objectif de la CI**
- La CI doit **vérifier** la qualité du code, pas la corriger
- Son rôle est de **détecter** les problèmes, pas de les résoudre
- Les corrections doivent être faites par le développeur en local


## Solution appliquée

### 1. **Suppression de l'étape problématique**
```yaml
#  AVANT (problématique)
- name: Auto fix lint issues
  run: npm run lint:fix

#  APRÈS (correct)
- name: Lint code
  run: npm run lint
```

### 2. **Séparation des responsabilités**

**En CI :**
- `npm run lint` → Vérifie la qualité du code
- Détecte les erreurs de style
- Fait échouer le build si des erreurs sont trouvées

**En local :**
- `npm run lint:fix` → Corrige automatiquement les erreurs
- Le développeur peut corriger avant de commiter
- Workflow de développement plus fluide

## Bonnes pratiques CI

###  **À faire en CI :**
- Vérifier la qualité du code (`npm run lint`)
- Vérifier la compilation (`npx tsc -noEmit`)
- Tester le build (`npm run build`)
- Détecter les problèmes

###  **À éviter en CI :**
- Modifier automatiquement les fichiers (`lint:fix`)
- Commiter automatiquement des changements
- Corriger le code sans validation humaine

## Résultat

**Avant :**
- CI modifiait les fichiers sans les commiter
- Incohérence entre environnements
- Workflow confus

**Maintenant :**
- CI vérifie seulement la qualité
- Développeur corrige en local avec `lint:fix`
- Workflow clair et prévisible
- Séparation des responsabilités

## Commandes utiles

```bash
# En local - Vérifier la qualité
npm run lint

# En local - Corriger automatiquement
npm run lint:fix

# En local - Vérifier TypeScript
npx tsc -noEmit

# En local - Build complet
npm run build
```
