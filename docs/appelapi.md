⚙️ Mon fonctionnement (comment je veux procéder)

Quand je cherche un film (ex: "Matrix"), je commence par interroger ma base locale (via mon API backend) :

SELECT * FROM film WHERE titre LIKE '%Matrix%'

Si je trouve le film dans ma base, parfait : je renvoie directement les données (plus rapide, pas d’appel API externe).

Si je ne le trouve pas, alors j’appelle l’API TMDB :

https://api.themoviedb.org/3/search/movie?api_key=...&language=fr-FR&query=Matrix

Je récupère le résultat, puis :

- j’ajoute le film dans ma table `film`z
- j’appelle `/movie/{id}/credits` pour récupérer le casting
- pour chaque acteur, j’appelle `/person/{id}?api_key=TA_CLE_API&language=fr-FR` pour récupérer ses détails (bio, photo, etc.)
- j’ajoute les acteurs et leurs liaisons dans la base

Ensuite, je renvoie les infos au front.

La prochaine fois que je cherche le même film, il sera déjà stocké → pas d’appel API externe.
 
---
 
Workflow parfait
 
1) L’utilisateur cherche un film
→ Vérifier dans la base locale (table `film`).
→ Si trouvé, renvoyer directement.
→ Sinon, passer à l’étape suivante.
 
2) Rechercher le film sur TMDB
GET https://api.themoviedb.org/3/search/movie?query={titre}&api_key=TA_CLE_API&language=fr-FR
→ Prendre le premier résultat (ou proposer une liste si plusieurs).
→ Insérer en base dans `film` avec les infos clés: `id_tmdb`, `titre`, `synopsis`, `date_sortie`, `affiche_url`, etc.
 
3) Récupérer les crédits (casting)
GET https://api.themoviedb.org/3/movie/{id}/credits?api_key=TA_CLE_API&language=fr-FR
→ Récupérer la liste des acteurs (cast).
→ Pour chaque acteur du cast:
   - Vérifier si l’acteur existe déjà en base (via `id_tmdb`).
   - Sinon, appeler sa fiche détaillée:
     GET https://api.themoviedb.org/3/person/{id}?api_key=TA_CLE_API&language=fr-FR
     → Récupérer nom, biographie, photo, date de naissance, etc., puis enregistrer dans la table `acteur`.
 
4) Lier film et acteurs
→ Insérer dans la table `film_acteur` une ligne par relation avec: `film_id`, `acteur_id`, et éventuellement `role` (character) et `ordre` (billing order).
 
5) Répondre au front
→ Retourner le film enrichi (détails + cast complet) depuis la base locale.

---

Workflow recherche d’un acteur

1) L’utilisateur cherche un acteur
→ Vérifier dans la base locale (table `acteur`).
→ Si trouvé, renvoyer directement.
→ Sinon, passer à l’étape suivante.

2) Rechercher l’acteur sur TMDB
GET https://api.themoviedb.org/3/search/person?query={nom}&api_key=TA_CLE_API&language=fr-FR
→ Prendre le premier résultat (ou proposer une liste si plusieurs).
→ Insérer/mettre à jour en base dans `acteur` avec: `id_tmdb`, `nom`, `biographie`, `photo_url`, `date_naissance`, `lieu_naissance`, etc.

3) Récupérer la filmographie (cast)
GET https://api.themoviedb.org/3/person/{id}/movie_credits?api_key=TA_CLE_API&language=fr-FR
→ Récupérer la liste des films dans lesquels il/elle a joué (`cast`).
→ Pour chaque film:
   - Vérifier s’il existe en base (`film` via `id_tmdb`).
   - Sinon, récupérer ses détails: GET https://api.themoviedb.org/3/movie/{id}?api_key=TA_CLE_API&language=fr-FR puis insérer dans `film`.
   - Créer/mettre à jour la liaison dans `film_acteur` avec `film_id`, `acteur_id`, et `role` (character) / `ordre`.

4) Répondre au front
→ Retourner l’acteur, ses détails et (optionnellement) une sélection de films liés depuis la base locale.