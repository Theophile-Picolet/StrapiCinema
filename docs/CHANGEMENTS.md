# Journal des changements

Date: 2025-10-20

## Résumé

Ce document récapitule les modifications effectuées pour préparer l'intégration continue (CI) et l'affichage des badges dans le `README.md`.

---

## 1) Pipeline GitHub Actions (CI)

Fichier modifié: `.github/workflows/ci.yml`

- Contexte du workflow:
  - Événements déclencheurs:
    - `push` sur toutes les branches sauf `main`
    - `pull_request` ciblant la branche `dev`
  - Étapes principales:
    - Checkout du dépôt 
    - Installation de Node.js 20 avec cache npm 
    - `npm ci`
    - Vérification TypeScript
    - Build du projet: `npm run build`

Impact: le pipeline est désormais exécutable sur GitHub Actions avec un exécuteur valide.

---

## 2) Badges dans le README

Fichier modifié: `README.md`

- Ajout des badges en en-tête:
  - CI (statique): `[![CI](https://img.shields.io/badge/CI-ready-blue.svg)](...)`
  - Build Status (statique): `[![Build Status](https://img.shields.io/badge/build-ready-orange.svg)](...)`
  - Node.js >= 20: badge informatif
  - Strapi v4.0: badge informatif

Motif: rendre visible l'état de préparation du pipeline et les prérequis techniques.


---

## 3) Passage aux badges dynamiques 

Après avoir poussé le dépôt sur GitHub et lancé au moins une exécution du workflow, remplacer les badges statiques par les URLs dynamiques suivantes:

1. Récupérer l'URL correcte du badge depuis l'onglet `Actions` de GitHub:
   - Aller dans `Actions` > sélectionner le workflow `CI` > bouton `Create status badge` (ou `...` puis `Create status badge`).
   - Copier le Markdown fourni par GitHub. Il aura la forme:
     ```
     [![CI](https://github.com/<org-ou-user>/<repo>/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/<org-ou-user>/<repo>/actions/workflows/ci.yml)
     ```
   - Adapter `branch=dev` si nécessaire.

2. Exemple d'intégration dans `README.md`:
   ```
   [![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/<org>/<repo>/actions/workflows/ci.yml)
   ```

3. Option: badge pour la branche `main` et pour les PRs:
   - `?branch=main` pour l'état de la branche principale
   - Ajouter un second badge si vous souhaitez afficher les deux

4. Validation:
   - Créer un commit ou une PR pour déclencher le workflow
   - Vérifier que le badge passe au vert si le build est OK

---
