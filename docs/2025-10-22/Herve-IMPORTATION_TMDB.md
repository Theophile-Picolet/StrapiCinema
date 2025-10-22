# Import TMDB vers Strapi

## Ce qu'on a fait

J'ai créé un script pour importer des films depuis TMDB vers Strapi. Au début c'était juste les films, mais maintenant on a aussi les genres et les acteurs avec toutes leurs infos.

## Les tables qu'on utilise

### Films (Movies)
- Les infos de base : titre, réalisateur, date, durée, note, etc.
- Un `tmdb_id` pour éviter les doublons

### Genres 
- Les genres de films (Action, Drame, Comédie...)
- Un slug auto-généré pour chaque genre

### Acteurs (Actors)
- Toutes les infos des acteurs : nom, biographie, date de naissance, lieu, photo...
- Récupéré depuis l'API TMDB `/person/{id}` pour avoir les données complètes
- Un `tmdb_id` pour éviter les doublons

### Tables de liaison
- **Movie-Genre** : lie les films aux genres
- **Movie-Actor** : lie les films aux acteurs avec le nom du personnage et l'ordre d'apparition

## Comment ça marche
```
Film ←→ Movie-Genre ←→ Genre
Film ←→ Movie-Actor ←→ Acteur
```

## Le problème avec Strapi v5

### Les relations qui posent problème

Avec Strapi v5, ils ont changé comment on fait les relations. Avant on pouvait juste mettre l'ID, maintenant il faut utiliser `documentId` et le format `connect`.

### Ce qui marche pas
```javascript
// ❌ Ça marche pas en v5
{
  data: {
    movie: movieId,
    genre: genreId
  }
}
```

### Ce qui marche
```javascript
// ✅ Ça marche en v5
{
  data: {
    movie: { connect: [{ documentId: movieDocumentId }] },
    genre: { connect: [{ documentId: genreDocumentId }] }
  }
}
```

### Le code qu'on utilise

```javascript
// Récupérer le documentId d'un film
async function getMovieDocumentIdByTmdbId(tmdbId) {
  const res = await fetch(
    `${STRAPI_URL}?filters[tmdb_id][$eq]=${tmdbId}&fields[0]=documentId`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  return res.json().data?.[0]?.documentId;
}

// Créer ou récupérer un genre
async function getOrCreateGenreByName(name) {
  // Chercher s'il existe déjà
  const found = await fetch(`${STRAPI_API_BASE}/genres?filters[slug][$eq]=${slug}`);
  if (found.data?.length) return found.data[0].documentId;
  
  // Le créer s'il existe pas
  const created = await fetch(`${STRAPI_API_BASE}/genres`, {
    method: 'POST',
    body: JSON.stringify({ data: { name, slug } })
  });
  return created.data.documentId;
}
```

## Ce que fait le script

### Films
- Récupère les infos depuis TMDB
- Vérifie s'il existe déjà (via `tmdb_id`)
- Import dans Strapi avec toutes les métadonnées

### Acteurs
- Récupère la liste des acteurs depuis `/credits`
- Pour chaque acteur, va chercher ses infos complètes via `/person/{id}`
- Crée l'acteur dans Strapi avec biographie, date de naissance, photo, etc.
- Lie l'acteur au film avec le nom du personnage et l'ordre d'apparition
- Limite à 10 acteurs par film pour pas surcharger

### Genres
- Crée les genres automatiquement depuis TMDB
- Génère des slugs uniques
- Évite les doublons

### Relations
- Utilise le format `connect` avec `documentId` pour Strapi v5
- Vérifie les doublons avant de créer des relations
- Gère les films existants (ajoute les genres/acteurs manquants)

## Configuration

```env
# Configuration dans .env
TMDB_API_KEY=your_tmdb_api_key
STRAPI_URL=http://localhost:1338/api/movies
STRAPI_API_TOKEN=your_strapi_token
TMDB_START_ID=1
TMDB_END_ID=30
```

## Utilisation

### Prérequis

1. Strapi v5 en cours d'exécution
2. Token API Strapi configuré
3. Clé API TMDB valide

### Lancement

```bash
# Installation des dépendances
npm install dotenv

# Configuration
cp .env.example .env
# Éditer .env avec vos clés API

# Lancement du script
node scripts/importers/tmdb-importer.mjs
```

### Résultat Attendu

```
 Début de l'importation des films depuis TMDB...
 Configuration: IDs 1 à 30
 URL Strapi: http://localhost:1338/api/movies
 Token présent: Oui
 Clé TMDB présente: Oui

 Traitement du film ID 2...
 Film ID 2 déjà présent, on passe (mais on lie les genres si besoin).
   ↳ Genre lié: Comédie (#2)
   ↳ Genre lié: Drame (#4)
   ↳ Genre lié: Romance (#6)

 Résumé de l'importation:
 Films importés avec succès: 0
 Films déjà présents: 23
 Erreurs: 7
 Total traité: 30
```

## Gestion des Erreurs

### Types d'Erreurs Gérées

1. **Films introuvables sur TMDB** (404)
   - IDs inexistants dans la base TMDB
   - Logs informatifs, pas d'arrêt du script

2. **Erreurs de connexion Strapi**
   - Vérifier que Strapi est lancé
   - Vérifier l'URL et le token

3. **Erreurs de validation**
   - Données manquantes ou invalides
   - Gestion des champs obligatoires

### Logs et Debugging

Le script fournit des logs détaillés :
- Configuration au démarrage
- Détails de chaque film traité
- Erreurs spécifiques avec contexte
- Résumé final avec statistiques

## Données des Acteurs

### Informations Récupérées

Le script récupère les données complètes de chaque acteur depuis l'API TMDB `/person/{id}` :

- **Informations de base** : `name`, `original_name`, `gender`
- **Biographie** : `biography` (texte complet)
- **Dates** : `birthday`, `deathday` (format date)
- **Lieu** : `place_of_birth` (ville, pays)
- **Photo** : `profile_path` (URL complète vers l'image)
- **Métadonnées** : `popularity`, `known_for_department`
- **Identifiant** : `tmdb_id` (pour éviter les doublons)
- **Slug** : généré automatiquement pour l'URL

### Relations Film-Acteur

Chaque relation `movie-actor` contient :
- **`character_name`** : nom du personnage joué
- **`order_index`** : ordre d'apparition dans le film (0, 1, 2...)
- **Relations** : liens vers `movie` et `actor` via `documentId`

### Optimisations

#### Performance

- Délai entre les requêtes (1 seconde par défaut)
- Vérification des doublons avant création
- Gestion des erreurs sans arrêt du script
- **Limitation à 10 acteurs par film** pour éviter la surcharge

#### Robustesse

- Gestion des films existants
- Création automatique des genres et acteurs manquants
- Récupération des données complètes des acteurs
- Gestion des erreurs TMDB pour les acteurs
- Évite les doublons de relations
- Récupération des données même en cas d'erreur partielle

## Maintenance

### Ajout de Nouveaux Films

Modifier la plage dans `.env` :
```env
TMDB_START_ID=31
TMDB_END_ID=60
```

### Mise à Jour des Relations

Le script gère automatiquement les films existants en ajoutant les genres manquants.

### Nettoyage

Pour supprimer des relations incorrectes, utiliser l'interface admin Strapi ou l'API directement.

## Conclusion

Ce système d'importation offre une solution robuste et flexible pour synchroniser une base de données de films depuis TMDB vers Strapi, avec une gestion complète des relations et des genres. La prise en compte des spécificités de Strapi v5 garantit la compatibilité et la performance du système.
