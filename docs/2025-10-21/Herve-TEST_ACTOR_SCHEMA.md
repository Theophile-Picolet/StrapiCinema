# Documentation du Test de Schéma Actor

## Vue d'ensemble

Ce document décrit en détail le test `actor-schema.test.ts` qui valide la structure et la cohérence du schéma du modèle Actor dans Strapi.

## Objectif du test

Le test `actor-schema.test.ts` a pour objectif de :
- Valider la structure du schéma JSON du modèle Actor
- Vérifier les attributs et leurs types
- Contrôler les relations entre modèles
- S'assurer de la cohérence de la configuration

## Localisation

```
tests/api/actor-schema.test.ts
```

## Structure du test

### 1. Configuration initiale

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Actor Schema Validation', () => {
  let actorSchema: any;

  beforeAll(() => {
    // Charger le schéma Actor depuis le fichier JSON
    const schemaPath = path.join(__dirname, '../../src/api/actor/content-types/actor/schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    actorSchema = JSON.parse(schemaContent);
  });
```

**Fonction :** Charge le fichier `schema.json` du modèle Actor au début des tests.

### 2. Tests de structure de base

```typescript
describe('Structure de base du schéma', () => {
  it('devrait avoir les propriétés de base requises', () => {
    expect(actorSchema).toHaveProperty('kind');
    expect(actorSchema).toHaveProperty('collectionName');
    expect(actorSchema).toHaveProperty('info');
    expect(actorSchema).toHaveProperty('options');
    expect(actorSchema).toHaveProperty('attributes');
  });
```

**Vérifications :**
- Présence des propriétés obligatoires
- Type `collectionType`
- Nom de collection `actors`
- Informations (singularName, pluralName, displayName)
- Option `draftAndPublish` activée

### 3. Tests des attributs

#### Attributs requis (13 au total)

```typescript
const expectedAttributes = [
  'slug',                    // Identifiant unique
  'tmdb_id',                // ID TMDB
  'name',                   // Nom de l'acteur
  'original_name',          // Nom original
  'gender',                 // Genre (0=non spécifié, 1=femme, 2=homme, 3=non-binaire)
  'biography',              // Biographie
  'birthday',               // Date de naissance
  'deathday',               // Date de décès
  'place_of_birth',         // Lieu de naissance
  'profile_path',           // Chemin de la photo de profil
  'popularity',             // Score de popularité
  'known_for_department',   // Département connu
  'actors'                  // Relation avec les films
];
```

#### Types de données validés

| Attribut | Type | Description |
|----------|------|-------------|
| `slug` | `uid` | Identifiant unique |
| `tmdb_id` | `integer` | ID TMDB |
| `name` | `string` | Nom de l'acteur |
| `original_name` | `string` | Nom original |
| `gender` | `integer` | Genre (0-3) |
| `biography` | `string` | Biographie |
| `birthday` | `date` | Date de naissance |
| `deathday` | `date` | Date de décès |
| `place_of_birth` | `string` | Lieu de naissance |
| `profile_path` | `string` | Chemin de la photo |
| `popularity` | `integer` | Score de popularité |
| `known_for_department` | `string` | Département connu |

### 4. Tests des relations

#### Relation avec movie-actor

```typescript
expect(actorSchema.attributes.actors.type).toBe('relation');
expect(actorSchema.attributes.actors.relation).toBe('oneToMany');
expect(actorSchema.attributes.actors.target).toBe('api::movie-actor.movie-actor');
expect(actorSchema.attributes.actors.mappedBy).toBe('actor');
```

**Signification :** Un acteur peut jouer dans plusieurs films (relation oneToMany).

### 5. Tests de validation JSON

```typescript
describe('Validation de la structure JSON', () => {
  it('devrait être un JSON valide', () => {
    expect(() => JSON.stringify(actorSchema)).not.toThrow();
  });

  it('devrait avoir une structure cohérente', () => {
    for (const attr of Object.keys(actorSchema.attributes)) {
      expect(actorSchema.attributes[attr]).toHaveProperty('type');
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
  it('devrait valider un objet actor correct', () => {
    const validActor = {
      slug: "leonardo-dicaprio",
      tmdb_id: 6193,
      name: "Leonardo DiCaprio",
      original_name: "Leonardo DiCaprio",
      gender: 2,
      biography: "Leonardo Wilhelm DiCaprio is an American actor...",
      birthday: "1974-11-11",
      deathday: null,
      place_of_birth: "Los Angeles, California, USA",
      profile_path: "/path/to/profile.jpg",
      popularity: 85,
      known_for_department: "Acting"
    };

    // Vérifier que tous les champs requis existent
    for (const field of Object.keys(validActor)) {
      expect(actorSchema.attributes).toHaveProperty(field);
    }
  });
});
```

**Fonction :** Teste qu'un objet actor valide correspond au schéma défini.

## Exécution du test

### Commande pour exécuter le test

```bash
# Exécuter uniquement ce test
npm test -- tests/api/actor-schema.test.ts

# Exécuter tous les tests
npm test

# Exécuter en mode watch
npm run test:watch
```

### Résultat attendu

```
Actor Schema Validation
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
    ✓ devrait valider un objet actor correct

10 tests passés
```

## Points de validation

### Structure Strapi
- `kind: "collectionType"`
- `collectionName: "actors"`
- `draftAndPublish: true`

### Attributs obligatoires
- 13 attributs présents
- Types corrects (string, date, integer, uid)
- Relations oneToMany configurées

### Relations
- `actors` → `api::movie-actor.movie-actor`

### Intégrité
- JSON valide
- Structure cohérente
- Données de test compatibles

## Maintenance

### Ajout d'un nouvel attribut
1. Ajouter l'attribut dans `expectedAttributes`
2. Ajouter le test de type correspondant
3. Mettre à jour l'objet `validActor` si nécessaire

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

- **Fichier source :** `src/api/actor/content-types/actor/schema.json`
- **Dépendances :** Aucune (test unitaire pur)
- **Performance :** Très rapide (< 1 seconde)
- **Maintenance :** Automatique avec les changements de schéma

## Avantages du test

1. Détection précoce des erreurs de schéma
2. Validation automatique des modifications
3. Documentation vivante de la structure
4. Confiance dans la cohérence des données
5. Facilite la maintenance du code

Ce test garantit que le modèle Actor reste cohérent et fonctionnel tout au long du développement.
