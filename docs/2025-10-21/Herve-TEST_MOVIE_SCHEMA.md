# Documentation du Test de Schéma Movie

## Vue d'ensemble

Ce document décrit en détail le test `movie-schema.test.ts` qui valide la structure et la cohérence du schéma du modèle Movie dans Strapi.

## Objectif du test

Le test `movie-schema.test.ts` a pour objectif de :
- Valider la structure du schéma JSON du modèle Movie
- Vérifier les attributs et leurs types
- Contrôler les relations entre modèles
- S'assurer de la cohérence de la configuration

## Localisation

```
tests/api/movie-schema.test.ts
```

## Structure du test

### 1. Configuration initiale

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Movie Schema Validation', () => {
  let movieSchema: any;

  beforeAll(() => {
    // Charger le schéma Movie depuis le fichier JSON
    const schemaPath = path.join(__dirname, '../../src/api/movie/content-types/movie/schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    movieSchema = JSON.parse(schemaContent);
  });
```

**Fonction :** Charge le fichier `schema.json` du modèle Movie au début des tests.

### 2. Tests de structure de base

```typescript
describe('Structure de base du schéma', () => {
  it('devrait avoir les propriétés de base requises', () => {
    expect(movieSchema).toHaveProperty('kind');
    expect(movieSchema).toHaveProperty('collectionName');
    expect(movieSchema).toHaveProperty('info');
    expect(movieSchema).toHaveProperty('options');
    expect(movieSchema).toHaveProperty('attributes');
  });
```

**Vérifications :**
- Présence des propriétés obligatoires
- Type `collectionType`
- Nom de collection `movies`
- Informations (singularName, pluralName, displayName)
- Option `draftAndPublish` activée

### 3. Tests des attributs

#### Attributs requis (13 au total)

```typescript
const expectedAttributes = [
  'title',           // Titre du film
  'description',      // Description courte
  'text',            // Contenu détaillé
  'director',        // Réalisateur
  'release_date',    // Date de sortie
  'runtime',         // Durée en minutes
  'poster_path',     // Chemin de l'affiche
  'backdrop_path',   // Chemin de l'image de fond
  'vote_average',     // Note moyenne
  'vote_count',      // Nombre de votes
  'movie_genres',    // Relation avec les genres
  'movies',          // Relation avec les acteurs
  'slug'             // Identifiant unique
];
```

#### Types de données validés

| Attribut | Type | Description |
|----------|------|-------------|
| `title` | `string` | Titre du film |
| `description` | `string` | Description courte |
| `text` | `string` | Contenu détaillé |
| `director` | `string` | Nom du réalisateur |
| `release_date` | `date` | Date de sortie |
| `runtime` | `integer` | Durée en minutes |
| `poster_path` | `string` | Chemin de l'affiche |
| `backdrop_path` | `string` | Chemin de l'image de fond |
| `vote_average` | `integer` | Note moyenne (0-10) |
| `vote_count` | `integer` | Nombre de votes |
| `slug` | `uid` | Identifiant unique |

### 4. Tests des relations

#### Relation avec movie-genre

```typescript
expect(movieSchema.attributes.movie_genres.type).toBe('relation');
expect(movieSchema.attributes.movie_genres.relation).toBe('oneToMany');
expect(movieSchema.attributes.movie_genres.target).toBe('api::movie-genre.movie-genre');
expect(movieSchema.attributes.movie_genres.mappedBy).toBe('movie');
```

**Signification :** Un film peut avoir plusieurs genres (relation oneToMany).

#### Relation avec movie-actor

```typescript
expect(movieSchema.attributes.movies.type).toBe('relation');
expect(movieSchema.attributes.movies.relation).toBe('oneToMany');
expect(movieSchema.attributes.movies.target).toBe('api::movie-actor.movie-actor');
expect(movieSchema.attributes.movies.mappedBy).toBe('movie');
```

**Signification :** Un film peut avoir plusieurs acteurs (relation oneToMany).

### 5. Tests de validation JSON

```typescript
describe('Validation de la structure JSON', () => {
  it('devrait être un JSON valide', () => {
    expect(() => JSON.stringify(movieSchema)).not.toThrow();
  });

  it('devrait avoir une structure cohérente', () => {
    for (const attr of Object.keys(movieSchema.attributes)) {
      expect(movieSchema.attributes[attr]).toHaveProperty('type');
    }
  });
});
```

**Vérifications :**
- JSON valide et sérialisable
- Tous les attributs ont un type défini

### 6. Tests de validation des données

```typescript
describe('Tests de validation des données', () => {
  it('devrait valider un objet movie correct', () => {
    const validMovie = {
      title: "Test Movie",
      description: "A test movie",
      text: "Movie content",
      director: "Test Director",
      release_date: "2023-01-01",
      runtime: 120,
      poster_path: "/path/to/poster.jpg",
      backdrop_path: "/path/to/backdrop.jpg",
      vote_average: 8,
      vote_count: 100,
      slug: "test-movie"
    };

    // Vérifier que tous les champs requis existent
    for (const field of Object.keys(validMovie)) {
      expect(movieSchema.attributes).toHaveProperty(field);
    }
  });
});
```

**Fonction :** Teste qu'un objet movie valide correspond au schéma défini.

## Exécution du test

### Commande pour exécuter le test

```bash
# Exécuter uniquement ce test
npm test -- tests/api/movie-schema.test.ts

# Exécuter tous les tests
npm test

# Exécuter en mode watch
npm run test:watch
```

### Résultat attendu

```
Movie Schema Validation
  Structure de base du schéma
    ✓ devrait avoir les propriétés de base requises
    ✓ devrait être de type collectionType
    ✓ devrait avoir le bon nom de collection
    ✓ devrait avoir les informations correctes
    ✓ devrait avoir draftAndPublish activé
  Attributs du schéma
    ✓ devrait avoir tous les attributs requis
    ✓ devrait avoir les bons types pour les attributs de base
    ✓ devrait avoir les bonnes relations
  Validation de la structure JSON
    ✓ devrait être un JSON valide
    ✓ devrait avoir une structure cohérente
  Tests de validation des données
    ✓ devrait valider un objet movie correct

10 tests passés
```

## Points de validation

### Structure Strapi
- `kind: "collectionType"`
- `collectionName: "movies"`
- `draftAndPublish: true`

### Attributs obligatoires
- 13 attributs présents
- Types corrects (string, date, integer, uid)
- Relations oneToMany configurées

### Relations
- `movie_genres` → `api::movie-genre.movie-genre`
- `movies` → `api::movie-actor.movie-actor`

### Intégrité
- JSON valide
- Structure cohérente
- Données de test compatibles

## Maintenance

### Ajout d'un nouvel attribut
1. Ajouter l'attribut dans `expectedAttributes`
2. Ajouter le test de type correspondant
3. Mettre à jour l'objet `validMovie` si nécessaire

### Modification d'une relation
1. Mettre à jour le test de relation correspondant
2. Vérifier le `target` et `mappedBy`
3. Tester la cohérence avec les autres modèles

### Dépannage
- **Test échoue** : Vérifier le schéma JSON
- **Attribut manquant** : Ajouter dans `expectedAttributes`
- **Type incorrect** : Corriger dans le schéma
- **Relation cassée** : Vérifier les modèles liés

## Notes importantes

- **Fichier source :** `src/api/movie/content-types/movie/schema.json`
- **Dépendances :** Aucune (test unitaire pur)
- **Performance :** Très rapide (< 1 seconde)
- **Maintenance :** Automatique avec les changements de schéma

## Avantages du test

1. Détection précoce des erreurs de schéma
2. Validation automatique des modifications
3. Documentation vivante de la structure
4. Confiance dans la cohérence des données
5. Facilite la maintenance du code

Ce test garantit que le modèle Movie reste cohérent et fonctionnel tout au long du développement.
