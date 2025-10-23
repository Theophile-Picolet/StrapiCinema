/**
 * movie-genre controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::movie-genre.movie-genre',({strapi}) => ({

  // Récupère tous les genres de film
  async find(ctx) {
    const movieGenres = await strapi.documents('api::movie-genre.movie-genre').findMany();
    ctx.body = movieGenres;
  },
  

  async findGenresByMovie(ctx) {
    const { id } = ctx.params;  // id du film
    const movieGenres = await strapi.documents('api::movie-genre.movie-genre').findMany({
      filters: { movie: id },
      populate: ['genre'],  //pour avoir le nom du genre
    });
  
    if (!movieGenres.length) {
      ctx.status = 404;
      ctx.body = { error: 'Aucun genre trouvé pour ce film' };
      return;
    }
  
    ctx.status = 200;
    ctx.body = movieGenres.map(item => item.genre); // on renvoie que les genres
  },
  

  // Récupère un genre de film par son documentId
  
  async findOne(ctx) {
    const { id } = ctx.params;
    const movieGenre = await strapi.documents('api::movie-genre.movie-genre').findOne({ documentId: id });
    if (!movieGenre) {
      ctx.status = 404;
      ctx.body = { error: 'Genre de film introuvable' };
      return;
    }
    ctx.status = 200;
    ctx.body = movieGenre;
  },

  

 }))