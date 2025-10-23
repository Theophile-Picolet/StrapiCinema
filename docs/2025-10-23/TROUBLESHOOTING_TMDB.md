# Guide de Dépannage - Importation TMDB

## Problèmes Courants et Solutions

### 1. Données nulles dans Strapi

#### Symptômes
```json
{
  "title": null,
  "description": null,
  "director": null,
  "tmdb_id": null
}
```

#### Causes Possibles
1. **Format d'envoi incorrect** : Le contrôleur attend les données directement, pas dans `{ data: ... }`
2. **Champ slug problématique** : Les champs `uid` ne peuvent pas être définis manuellement
3. **Contrôleur personnalisé** : Incompatibilité avec le format attendu

#### Solutions
```javascript
// ❌ Incorrect
body: JSON.stringify({ data: movieData })

// ✅ Correct
body: JSON.stringify(movieData)
```

### 2. Doublons créés

#### Symptômes
- Même film importé plusieurs fois
- Message "Film importé avec succès" répété

#### Causes Possibles
1. **Fonction `checkMovieExists()` défaillante**
2. **Syntaxe de filtrage incorrecte** avec Strapi v5
3. **Erreurs de connexion** masquées

#### Solutions
```javascript
// Vérification manuelle des données
const data = await response.json();
const movies = Array.isArray(data) ? data : [];
const exists = movies.some(movie => movie.tmdb_id === tmdbId);
```

### 3. Erreurs "fetch failed"

#### Symptômes
```
Erreur lors de la vérification du film ID 35: fetch failed
Erreur lors de l'import dans Strapi: fetch failed
```

#### Causes Possibles
1. **Strapi non démarré**
2. **Problèmes de proxy/DNS**
3. **Token d'authentification invalide**
4. **Port incorrect**

#### Solutions
```bash
# Vérifier que Strapi est accessible
curl -s http://localhost:1338/api/movies

# Vérifier le token
echo $STRAPI_API_TOKEN

# Vérifier la configuration
cat .env | grep STRAPI
```

### 4. Liaisons manquantes (genres/acteurs)

#### Symptômes
- Film créé mais sans genres
- Film créé mais sans acteurs
- Erreurs "Lien movie-genre KO"

#### Causes Possibles
1. **Format de liaison incorrect** pour Strapi v5
2. **Genres/acteurs non créés**
3. **Relations mal configurées**

#### Solutions
```javascript
// Format correct pour Strapi v5
{
  data: {
    movie: { connect: [{ documentId: movieDocumentId }] },
    genre: { connect: [{ documentId: genreDocumentId }] }
  }
}
```

## Diagnostic Avancé

### 1. Vérifier la Configuration

```bash
# Vérifier les variables d'environnement
node -e "console.log(process.env.STRAPI_URL)"
node -e "console.log(process.env.TMDB_API_KEY)"

# Tester la connexion TMDB
curl "https://api.themoviedb.org/3/movie/35?api_key=YOUR_KEY"

# Tester la connexion Strapi
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:1338/api/movies
```

### 2. Debug du Script

```javascript
// Ajouter des logs de debug
console.log('Données envoyées:', JSON.stringify(movieData, null, 2));
console.log('Réponse Strapi:', JSON.stringify(result, null, 2));
console.log('Films existants:', movies.map(m => ({ id: m.id, tmdb_id: m.tmdb_id })));
```

### 3. Vérifier le Schéma Strapi

```json
// Vérifier que le schéma est correct
{
  "tmdb_id": {
    "type": "integer"
  },
  "title": {
    "type": "string"
  }
  // ... autres champs
}
```

## Solutions par Problème

### Problème : "Toutes les données sont nulles"

1. Vérifier le format d'envoi des données
2. Supprimer les champs `uid` problématiques
3. Vérifier le contrôleur personnalisé

### Problème : "Doublons créés"

1. Améliorer la fonction `checkMovieExists()`
2. Utiliser la récupération manuelle au lieu des filtres
3. Ajouter des logs de debug

### Problème : "Erreurs de connexion"

1. Vérifier que Strapi est démarré
2. Tester avec curl
3. Vérifier les tokens d'authentification

### Problème : "Liaisons manquantes"

1. Vérifier le format des relations Strapi v5
2. S'assurer que les entités liées existent
3. Utiliser le format `connect` avec `documentId`

## Prévention des Problèmes

### 1. Tests Réguliers
```bash
# Tester avec un film unique
TMDB_START_ID=999 TMDB_END_ID=999 node scripts/importers/tmdb-importer.mjs

# Vérifier les résultats
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" http://localhost:1338/api/movies | jq '.[] | select(.tmdb_id == 999)'
```

### 2. Monitoring
- Surveiller les logs d'importation
- Vérifier régulièrement les doublons
- Tester les liaisons genres/acteurs

### 3. Sauvegarde
- Sauvegarder la base de données avant les imports massifs
- Garder une trace des imports effectués
- Documenter les configurations utilisées

## Commandes Utiles

```bash
# Nettoyer les doublons (manuel)
# Via l'interface Strapi ou script de nettoyage

# Vérifier les films par tmdb_id
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" "http://localhost:1338/api/movies" | jq '.[] | select(.tmdb_id == 35)'

# Compter les films
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" "http://localhost:1338/api/movies" | jq 'length'

# Lister les tmdb_id uniques
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" "http://localhost:1338/api/movies" | jq '[.[] | .tmdb_id] | unique'
```
