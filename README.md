#  CineVerse - API Strapi Cinema

## Contexte du projet

###  Formation CDA - Éco-conception

Ce projet s'inscrit dans le cadre de la formation **Concepteur Développeur d'Applications (CDA)** avec une approche **éco-conception**. L'objectif est de développer une solution technique performante tout en minimisant l'impact environnemental du système.

###  Mission CineVerse

La société **CineVerse** souhaite moderniser la gestion de son catalogue de films et d'acteurs. Jusqu'ici, les données étaient dispersées entre plusieurs outils non connectés. L'entreprise souhaite désormais disposer d'un système centralisé et automatisé capable d'importer des données depuis une source publique (TMDb), de les gérer dans une base locale, et de les exposer via une API interne sécurisée.

Les développeurs sont chargés de concevoir ce système en utilisant **Strapi** comme CMS headless, et en garantissant la qualité, la cohérence et la sécurité des échanges de données.

##  Objectifs

L'équipe de développement devra :

- ✅ Installer et configurer un projet Strapi
- ✅ Créer deux modèles de données : **Movie** et **Actor** avec relations
- ✅ Consommer l'API externe TMDb pour récupérer films et acteurs
- ✅ Documenter toutes les requêtes API utilisées (REST)
- ✅ Sécuriser l'accès à l'API (authentification par token)
- ✅ Tester et valider les endpoints avec différents outils
- ✅ Présenter le projet final et la documentation technique complète

##  Fonctionnalités clés

- **Gestion des films** : CRUD complet avec métadonnées TMDb
- **Gestion des acteurs** : Profils détaillés avec filmographie  
- **Import automatique** : Synchronisation avec l'API TMDb
- **API sécurisée** : Authentification JWT et gestion des rôles
- **Interface admin** : Back-office Strapi pour la gestion
- **Documentation** : API complètement documentée et testée

##  Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrage
npm run develop
```

L'application sera accessible sur `http://localhost:1337`

>  **Guide d'installation détaillé** : Voir [docs/INSTALLATION.md](docs/INSTALLATION.md)

##  Documentation technique

- **[Modèle de base de données](docs/MODELE_BDD.md)** - Schéma complet avec diagrammes Mermaid
- **[Guide d'installation](docs/INSTALLATION.md)** - Configuration détaillée


##  Architecture du projet

```
StrapiCinema/
├── src/
│   ├── api/                 # Modèles Strapi (Movie, Actor, etc.)
│   ├── components/          # Composants partagés
│   └── extensions/          # Extensions personnalisées
├── docs/                    # Documentation technique
├── scripts/                 # Scripts d'import TMDb
└── public/                  # Fichiers statiques
```

##  Fonctionnalités principales

- **Gestion des films** : CRUD complet avec métadonnées TMDb
- **Gestion des acteurs** : Profils détaillés avec filmographie
- **Import automatique** : Synchronisation avec l'API TMDb
- **API sécurisée** : Authentification JWT et gestion des rôles
- **Interface admin** : Back-office Strapi pour la gestion


## 👥 Équipe

- **Développeur** : [Théophile Picolet](https://github.com/Theophile-Picolet)
- **Développeur** : [Hervé Lorge](https://gitlab.com/hervelge)
- **Développeur** : [Rahal Abdelghani](https://github.com/abdel92000)

