import dotenv from 'dotenv';

/******************************************************
 * Utiliser l'API fetch native de Node.js (Node >=18)
 ******************************************************/

/******************************************************
 * Charger les variables d'environnement
 ******************************************************/
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338/api/movies';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const STRAPI_API_BASE = STRAPI_URL.replace(/\/movies$/, '');

/******************************************************
 * Configuration
 ******************************************************/
let startId = Number(process.env.TMDB_START_ID ?? 1);
let endId = Number(process.env.TMDB_END_ID ?? 10);
if (Number.isNaN(startId)) startId = 1;
if (Number.isNaN(endId)) endId = 10;
if (startId > endId) {
  const tmp = startId; startId = endId; endId = tmp;
}
const CONFIG = {
  startId,
  endId,
  batchSize: 5,
  delay: 1000,
};

/******************************************************
 * Fonction pour attendre un délai
 ******************************************************/
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/******************************************************
 * Vérifier si un film existe déjà dans Strapi
 ******************************************************/
async function checkMovieExists(tmdbId) {
  try {
    const response = await fetch(`${STRAPI_URL}?filters[tmdb_id][$eq]=${tmdbId}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data?.data?.length > 0;
  } catch (error) {
    console.error(` Erreur lors de la vérification du film ID ${tmdbId}:`, error.message);
    return false;
  }
}

/******************************************************
 * Récupérer l'ID Strapi d'un film via son tmdb_id
 ******************************************************/
async function getMovieDocumentIdByTmdbId(tmdbId) {
    const res = await fetch(
      `${STRAPI_URL}?filters[tmdb_id][$eq]=${tmdbId}&fields[0]=documentId`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.documentId ?? null;
  }
  

/******************************************************
 * Récupérer les données d'un film depuis TMDB
 ******************************************************/
async function fetchMovieData(tmdbId) {
  try {
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!movieResponse.ok) {
      throw new Error(`Erreur TMDB: ${movieResponse.status}`);
    }

    const movie = await movieResponse.json();

    if (movie.success === false || !movie.title) {
      return null;
    }

    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    let director = 'Inconnu';
    let credits = null;
    if (creditsResponse.ok) {
      credits = await creditsResponse.json();
      director = credits.crew?.find(p => p.job === 'Director')?.name || 'Inconnu';
    }

    // Ajouter les crédits à l'objet movie pour les acteurs
    if (credits) {
      movie.credits = credits;
    }

    return { movie, director };
  } catch (error) {
    console.error(` Erreur lors de la récupération du film ID ${tmdbId}:`, error.message);
    return null;
  }
}

/******************************************************
 * Créer le slug à partir du titre
 ******************************************************/
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .trim();
}

/******************************************************
 * Préparer les données du film pour Strapi
 ******************************************************/
function prepareMovieData(movie, director) {
  return {
    title: movie.title,
    description: movie.overview || '',
    text: movie.tagline || '',
    director: director,
    release_date: movie.release_date || null,
    runtime: movie.runtime || 0,
    poster_path: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    backdrop_path: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : null,
    vote_average: Math.round(movie.vote_average),
    vote_count: movie.vote_count || 0,
    slug: createSlug(movie.title),
    tmdb_id: movie.id,
  };
}

/******************************************************
 * Importer un film dans Strapi
 ******************************************************/
async function importMovieToStrapi(movieData) {
  try {
    const response = await fetch(STRAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: movieData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Strapi: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result?.data?.documentId;    
  } catch (error) {
    console.error(` Erreur lors de l'import dans Strapi:`, error.message);
    throw error;
  }
}

/******************************************************
 * Genre helpers: get or create, and link movie-genre
 ******************************************************/
async function getOrCreateGenreByName(name) {
  const slug = createSlug(name);
  const searchUrl = `${STRAPI_API_BASE}/genres?filters[slug][$eq]=${encodeURIComponent(slug)}`;
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const findRes = await fetch(searchUrl, { headers });
  if (!findRes.ok) throw new Error(`Recherche genre KO: ${findRes.status}`);
  const found = await findRes.json();
  if (found?.data?.length) return found.data[0].documentId;

  const createRes = await fetch(`${STRAPI_API_BASE}/genres`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: { name, slug } })
  });
  if (!createRes.ok) {
    const t = await createRes.text();
    throw new Error(`Création genre KO: ${createRes.status} - ${t}`);
  }
  const created = await createRes.json();
  return created?.data?.documentId;
}

async function linkExists(movieDocumentId, genreDocumentId) {
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const url = `${STRAPI_API_BASE}/movie-genres?filters[movie][documentId][$eq]=${movieDocumentId}&filters[genre][documentId][$eq]=${genreDocumentId}&fields[0]=id`;
  const res = await fetch(url, { headers });
  if (!res.ok) return false;
  const data = await res.json();
  return (data?.data?.length ?? 0) > 0;
}

async function linkMovieToGenre(movieDocumentId, genreDocumentId) {
  if (await linkExists(movieDocumentId, genreDocumentId)) return; 
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };
  console.log('Creating link:', {
        movie: movieDocumentId,
        genre: genreDocumentId,
    url: `${STRAPI_API_BASE}/movie-genres`
  });
  
  const res = await fetch(`${STRAPI_API_BASE}/movie-genres`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        "movie": { "connect": [ { "documentId": movieDocumentId } ] },
        "genre": { "connect": [ { "documentId": genreDocumentId } ] }

      }
    })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lien movie-genre KO: ${res.status} - ${t}`);
  }
}

async function linkMovieGenres(movieDocumentId, movie) {
  if (!Array.isArray(movie.genres) || movie.genres.length === 0) return;
  for (const g of movie.genres) {
    const genreName = g.name?.trim();
    if (!genreName) continue;
    try {
      const genreDocumentId = await getOrCreateGenreByName(genreName);
      await linkMovieToGenre(movieDocumentId, genreDocumentId);
      console.log(`   ↳ Genre lié: ${genreName} (#${genreDocumentId})`);
    } catch (error_) {
      console.error(`   ↳ Erreur genre (${genreName}):`, error_.message);
    }
  }
}

/******************************************************
 * acteurs : récupération/création et liaison film-acteur
 ******************************************************/
async function getOrCreateActorByTmdbId(tmdbId, actorData) {
  const searchUrl = `${STRAPI_API_BASE}/actors?filters[tmdb_id][$eq]=${tmdbId}`;
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const findRes = await fetch(searchUrl, { headers });
  if (!findRes.ok) throw new Error(`Recherche acteur échouée: ${findRes.status}`);
  const found = await findRes.json();
  if (found?.data?.length) return found.data[0].documentId;

  //** Récupérer les données complètes de l'acteur depuis TMDB */
  const fullActorData = await fetchFullActorData(tmdbId);
  if (!fullActorData) {
    throw new Error(`Impossible de récupérer les données complètes de l'acteur ${tmdbId}`);
  }

  //** Debug: afficher les données récupérées */
  console.log(`   ↳ Données acteur ${fullActorData.name}:`, {
    biography: fullActorData.biography?.substring(0, 50) + '...',
    birthday: fullActorData.birthday,
    place_of_birth: fullActorData.place_of_birth,
    popularity: fullActorData.popularity
  });

  const actorSlug = createSlug(fullActorData.name);
  const createRes = await fetch(`${STRAPI_API_BASE}/actors`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        tmdb_id: fullActorData.id,
        name: fullActorData.name,
        original_name: fullActorData.original_name || fullActorData.name,
        gender: fullActorData.gender || 0,
        biography: fullActorData.biography || '',
        birthday: fullActorData.birthday || null,
        deathday: fullActorData.deathday || null,
        place_of_birth: fullActorData.place_of_birth || '',
        profile_path: fullActorData.profile_path 
          ? `https://image.tmdb.org/t/p/w500${fullActorData.profile_path}`
          : null,
        popularity: Math.round(fullActorData.popularity || 0),
        known_for_department: fullActorData.known_for_department || '',
        slug: actorSlug
      }
    })
  });
  if (!createRes.ok) {
    const t = await createRes.text();
    throw new Error(`Création acteur échouée: ${createRes.status} - ${t}`);
  }
  const created = await createRes.json();
  return created?.data?.documentId;
}

/******************************************************
 * Récupérer les données complètes d'un acteur depuis TMDB
 ******************************************************/
async function fetchFullActorData(tmdbId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/person/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );

    if (!response.ok) {
      throw new Error(`Erreur TMDB acteur: ${response.status}`);
    }

    const actorData = await response.json();
    
    if (actorData.success === false || !actorData.name) {
      return null;
    }

    return actorData;
  } catch (error) {
    console.error(` Erreur lors de la récupération de l'acteur ID ${tmdbId}:`, error.message);
    return null;
  }
}

async function linkExistsActor(movieDocumentId, actorDocumentId) {
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const url = `${STRAPI_API_BASE}/movie-actors?filters[movie][documentId][$eq]=${movieDocumentId}&filters[actor][documentId][$eq]=${actorDocumentId}&fields[0]=id`;
  const res = await fetch(url, { headers });
  if (!res.ok) return false;
  const data = await res.json();
  return (data?.data?.length ?? 0) > 0;
}

async function linkMovieToActor(movieDocumentId, actorDocumentId, characterName, orderIndex) {
  if (await linkExistsActor(movieDocumentId, actorDocumentId)) return;
  const headers = {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${STRAPI_API_BASE}/movie-actors`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        movie: { connect: [{ documentId: movieDocumentId }] },
        actor: { connect: [{ documentId: actorDocumentId }] },
        character_name: characterName || '',
        order_index: orderIndex || 0
      }
    })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Liaison film-acteur échouée: ${res.status} - ${t}`);
  }
}

async function linkMovieActors(movieDocumentId, movie) {
  if (!Array.isArray(movie.credits?.cast) || movie.credits.cast.length === 0) return;
  
  // Limiter aux 10 premiers acteurs pour éviter trop de données
  const topActors = movie.credits.cast.slice(0, 10);
  
  for (let i = 0; i < topActors.length; i++) {
    const actor = topActors[i];
    const actorName = actor.name?.trim();
    if (!actorName) continue;
    
    try {
      const actorDocumentId = await getOrCreateActorByTmdbId(actor.id, actor);
      await linkMovieToActor(movieDocumentId, actorDocumentId, actor.character, i);
      console.log(`   ↳ Acteur lié: ${actorName} (#${actorDocumentId})`);
    } catch (error_) {
      console.error(`   ↳ Erreur acteur (${actorName}):`, error_.message);
    }
  }
}

/******************************************************
 * Logging utilitaire
 ******************************************************/
function logMovieData(title, data) {
  console.log(` Données du film "${title}":`);
  console.log(`   - Titre: ${data.title}`);
  console.log(`   - Réalisateur: ${data.director}`);
  console.log(`   - Date de sortie: ${data.release_date}`);
  console.log(`   - Durée: ${data.runtime} min`);
  console.log(`   - Note: ${data.vote_average}/10`);
  console.log(`   - Slug: ${data.slug}`);
  console.log(`   - TMDB ID: ${data.tmdb_id}`);
}

/******************************************************
 * Traitement unitaire d'un film
 ******************************************************/
async function processMovie(id) {
  console.log(`\n Traitement du film ID ${id}...`);

  const exists = await checkMovieExists(id);
  if (exists) {
    console.log(` Film ID ${id} déjà présent, on passe (mais on lie les genres si besoin).`);
    const movieData = await fetchMovieData(id);
    if (movieData) {
      const movieId = await getMovieDocumentIdByTmdbId(id);
      if (movieId) {
        await linkMovieGenres(movieId, movieData.movie);
        await linkMovieActors(movieId, movieData.movie);
      }
    }
    return { imported: 0, skipped: 1, errors: 0 };
  }

  const movieData = await fetchMovieData(id);
  if (!movieData) {
    console.log(` ID ${id} - Film introuvable sur TMDB`);
    return { imported: 0, skipped: 0, errors: 1 };
  }

  const { movie, director } = movieData;
  console.log(` Récupération du film : ${movie.title}`);

  const strapiData = prepareMovieData(movie, director);
  logMovieData(movie.title, strapiData);

  const movieId = await importMovieToStrapi(strapiData);
  console.log(` Film "${movie.title}" importé avec ID ${movieId}`);

  await linkMovieGenres(movieId, movie);
  await linkMovieActors(movieId, movie);

  return { imported: 1, skipped: 0, errors: 0 };
}

/******************************************************
 * Importation principale
 ******************************************************/
export async function importMovies() {
  console.log(' Début de l\'importation des films depuis TMDB...');
  console.log(` Configuration: IDs ${CONFIG.startId} à ${CONFIG.endId}`);
  console.log(` URL Strapi: ${STRAPI_URL}`);
  console.log(` Token présent: ${STRAPI_TOKEN ? 'Oui' : 'Non'}`);
  console.log(` Clé TMDB présente: ${TMDB_API_KEY ? 'Oui' : 'Non'}\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let id = CONFIG.startId; id <= CONFIG.endId; id++) {
    try {
      const { imported, skipped, errors } = await processMovie(id);
      successCount += imported;
      skippedCount += skipped;
      errorCount += errors;

      if (id < CONFIG.endId) {
        await delay(CONFIG.delay);
      }
    } catch (error) {
      console.error(` Erreur avec l'ID ${id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n Résumé de l\'importation:');
  console.log(` Films importés avec succès: ${successCount}`);
  console.log(` Films déjà présents: ${skippedCount}`);
  console.log(` Erreurs: ${errorCount}`);
  console.log(` Total traité: ${successCount + skippedCount + errorCount}`);
}

/******************************************************
 * Exécution du script (top-level await, pas d'IIFE)
 ******************************************************/
console.log(' Script démarré...');

try {
  await importMovies();
} catch (error) {
  console.error(' Erreur fatale:', error);
  process.exit(1);
}
