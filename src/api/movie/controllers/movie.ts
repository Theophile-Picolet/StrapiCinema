/**
 * movie controller
 */

import { factories } from '@strapi/strapi'
export default factories.createCoreController('api::movie.movie',({strapi}) => ({

  async find(ctx) {

    // Récupère tous les films
    const movies = await strapi.documents('api::movie.movie').findMany();

    // renveoyer les films 
    ctx.body = movies; 
  },

  async findOne(ctx) {
    console.log('ctx.query.movieId=>', ctx.query.movieId);
    
    const movieId = ctx.params.id; 
    
    try {
      const movie = await strapi.documents('api::movie.movie').findOne({
        documentId: movieId
      });
      console.log('Movie found', movie);
      ctx.body = movie;
    } catch (error) {
      console.log('Error', error);
      ctx.throw(404, 'Movie not found');
    }
  },

  // async findByTitle(ctx) {
  //   console.log('ctx.query.title=>', ctx.query.title);
    
  //   const title = ctx.query.title as string;
  //   console.log('title=>', title);
  //   if (!title) {
  //     ctx.badRequest("Le paramètre 'title' est manquant.");
  //     return;
  //   }

  //   const existingMovie = await strapi.documents("api::movie.movie").findMany({
  //     filters: { title: title },
  //     limit: 1,
  //   });

  //   if(existingMovie.length > 0) {
  //     ctx.body = existingMovie;
  //     return;
  //   }

  //   if(existingMovie.length === 0 || existingMovie === null) {
  //     ctx.body = { message: 'Aucun film trouvé avec ce titre exact' };
  //     return;
  //   }

  //   ctx.body = { message: 'Aucun film trouvé avec ce titre exact' };
  //   return;
  // },

  async create(ctx) {
    const movie = await strapi.documents('api::movie.movie').create({
      data: ctx.request.body
    });
    ctx.body = movie;
  },

// methode pour rechercher un film par titre 
  async fromTitle(ctx) {
  const title = ctx.query.title as string;
  console.log('title=>', title);
  if (!title) {
    ctx.badRequest("Le paramètre 'title' est manquant.");
    return;
  }

  const existingMovie = await strapi.documents('api::movie.movie').findMany({
    filters: { title: { $eqi: title } },
    limit: 1,
  });

  if (existingMovie.length > 0) {
    
    // si il existe un film dnas notre db on recuepre le id document et on renvoie le film 
    const moiveid = existingMovie[0].documentId;
    const movie = await strapi.documents('api::movie.movie').findOne({
      documentId: moiveid
    });

    ctx.body = movie;
    return;
  }

  if(existingMovie.length === 0 ||existingMovie === null){ 
    console.log('pas de film trouvé dans la base de données');
  }

//  Chercher le film sur l’API TMDB
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${title}&language=fr-FR`
  );
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataMovies = await response.json() as any;

// on filtre les films qui ont le meme titre que le titre recherché
  const exactMatches = dataMovies.results.filter(
    (movie) => movie.title.toLowerCase() === title.toLowerCase()
  );

  if (exactMatches.length === 0) {
    console.log('Aucun film ne correspond exactement à ce titre.');
    ctx.body = { message: 'Aucun film trouvé avec ce titre exact' };
    return;
  }

// Boucle pour chaque film trouvé
  for(let i = 0; i < dataMovies.results.length; i++){
    console.log('film trouvé =>', dataMovies.results[i].title);
// pour chaque film je récupère les détails

// je récupère 1 film par 1 par la boucle for
    const responseMovie = await fetch(`https://api.themoviedb.org/3/movie/${dataMovies.results[i].id}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`);
    
// Pour chaque film je récupère les détails du film
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailsMovie = await responseMovie.json() as any;
    console.log('detailsMovie=>', detailsMovie);
    const runtime = detailsMovie.runtime;

//  Pour chaque film je récupère les détails des acteurs
    const requestCredits = await fetch(
      `https://api.themoviedb.org/3/movie/${detailsMovie.id}/credits?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`
    );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseCredits = await requestCredits.json() as any;
    const crew = responseCredits.crew;
    const actors = responseCredits.cast;
    console.log(`nbr d'acteurs=>`, actors.length);
 
// On cherche la première personne du crew dont le métier est "Director"
const director = crew.find(actor => actor.job === "Director")?.name;

    const movieData = {
      tmdb_id: dataMovies.results[i].id,           
      title: dataMovies.results[i].title,             
      description: dataMovies.results[i].overview,      
      release_date: dataMovies.results[i].release_date,      
      director: director,         
      runtime:runtime,            
      poster_path: dataMovies.results[i].poster_path,      
      backdrop_path: dataMovies.results[i].backdrop_path,     
      vote_average: dataMovies.results[i].vote_average,      
      vote_count: dataMovies.results[i].vote_count,        
    };

// ajoute le film en base de données
try {
  const movieCreated = await strapi.documents('api::movie.movie').create({ data: movieData });
  const movieDocId = movieCreated.documentId;
  const movieDetails = await strapi.documents('api::movie.movie').findOne({
    documentId: movieDocId
  });
  ctx.body = movieDetails;
  // const movieDocId = movieCreated.documentId;

  const genres = detailsMovie.genres;

// ajoute le cast du film en base de données
  for(let k = 0; k < actors.length; k++){
    // avant de cree lacteur tcheker si il existe deja dans la base de données
    const actorCreated = await strapi.documents('api::actor.actor').create({
      data: {
        tmdb_id: actors[k].id,
        name: actors[k].name,
        original_name: actors[k].original_name,
        gender: actors[k].gender,
        biography: actors[k].biography,
        birthday: actors[k].birthday,
        deathday: actors[k].deathday,
        place_of_birth: actors[k].place_of_birth,
        profile_path: actors[k].profile_path,
        popularity: actors[k].popularity,
        known_for_department: actors[k].known_for_department,
      },
    });

    const movieCastCreated = await strapi.documents('api::movie-actor.movie-actor').create({
      data: { movie: movieCreated.id, actor: actorCreated.id, character_name: actors[k].character, order_index: actors[k].order }
    });

  } 

// ajoute le genre du film en base de données

  for(let j = 0; j < genres.length; j++) {
    console.log('genres[j].id=>', genres[j].id);
    console.log('genres[j].name=>', genres[j].name);
    
    const genreCreated = await strapi.documents('api::genre.genre').create({
      data: { name: genres[j].name, tmdb_id: genres[j].id }
    });
    
    const movieGenreCreated = await strapi.documents('api::movie-genre.movie-genre').create({
      data: { movie: movieCreated.documentId, genre: genreCreated.documentId }
    });

    if(!movieGenreCreated){
      console.log('genre non ajouté dans la base de données');
      return
    }

  } 
    } catch (error) {
      console.log('error=>', error.message.toString());
      return;
    }
return;
}

},

async delete(ctx) {
  const movieId = ctx.params.id;
  try {
    const deletedMovie = await strapi.documents('api::movie.movie').delete({
      documentId: movieId
    });
    ctx.body = { message: 'Film supprimé avec succès', movie: deletedMovie };
  } catch (error) {
    console.error('Erreur lors de la suppression du film:', error);
    ctx.throw(500, 'Erreur lors de la suppression du film');
  }
},

// Fonction pour supprimer tous les films
async deleteAll(ctx) {
  try {
    // Récupèrer tous les films
    const allMovies = await strapi.documents('api::movie.movie').findMany();
    
    if (allMovies.length === 0) {
      ctx.body = { message: 'Aucun film à supprimer' };
      return;
    }

    // Supprimer tous les films
    const deletedMovies = [];
    for (const movie of allMovies) {
      await strapi.documents('api::movie.movie').delete({
        documentId: movie.documentId
      });
      deletedMovies.push(movie.title);
    }

    ctx.body = { 
      message: `${deletedMovies.length} films supprimés avec succès`,
      deletedMovies: deletedMovies
    };
  } catch (error) {
    console.error('Erreur lors de la suppression des films:', error);
    ctx.throw(500, 'Erreur lors de la suppression des films');
  }
},

}));
