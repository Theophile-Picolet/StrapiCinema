# Tests des schémas Strapi

## Pourquoi on les a mis
- Pour éviter les mauvaises surprises quand on touche aux schémas Strapi
- Si un champ est supprimé/renommé par erreur, le CI échoue tout de suite

## Ce que ça vérifie
- La structure de base existe: `kind`, `collectionName`, `info`, `options`, `attributes`
- Les champs attendus sont bien là (ex: `tmdb_id`, `biography`, `vote_average`, etc.)
- Les types des champs sont corrects (string, integer, date, uid…)
- Les relations sont bien câblées:
  - `movie` ↔ `movie-genre`
  - `movie` ↔ `movie-actor`
  - `actor` ↔ `movie-actor`

## Où sont les tests
- `tests/api/actor-schema.test.ts`
- `tests/api/movie-schema.test.ts`

## Comment les lancer
```bash
npm test
# ou ciblé
npx jest tests/api/actor-schema.test.ts
npx jest tests/api/movie-schema.test.ts
```

## Ce que ça sort
- "3 passed" quand tout est bon
- Si quelque chose manque/est mal typé, le test te dit exactement quoi et où

## Exemple d'erreur
```
✖ 1 failed, 2 passed
  ● Actor Schema › Attributs du schéma › devrait avoir tous les attributs requis
    expect(received).toHaveProperty(expected)
    Expected: "tmdb_id"
    Received: object
```

Ça veut dire que le champ `tmdb_id` manque dans le schéma `actor`.
