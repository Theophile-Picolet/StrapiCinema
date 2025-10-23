/**
 * movie-actor controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::movie-actor.movie-actor',({strapi}) => ({

  // Récupère tous les casting
  async find(ctx) {
    const movieActors = await strapi.documents('api::movie-actor.movie-actor').findMany();
    if (!movieActors) {
      ctx.status = 404;
      ctx.body = { error: 'Casting introuvable' };
      return;
    }
    ctx.status = 200;
    ctx.body = movieActors;
  },

  async findByMovie(ctx) {
    const { movieId } = ctx.params;
    const movieActors = await strapi.documents('api::movie-actor.movie-actor').findMany({
      filters: { movie: { documentId: movieId } },
      populate: ['actor']
    });
    
    ctx.status = 200;
    ctx.body = movieActors;
  },

  // Récupère un casting par son documentId
  async findOne(ctx) {
    const { id } = ctx.params;
    const movieActor = await strapi.documents('api::movie-actor.movie-actor').findOne({ documentId: id });
    if (!movieActor) {
      ctx.status = 404;
      ctx.body = { error: 'Casting introuvable' };
      return;
    }
    ctx.status = 200;
    ctx.body = movieActor;
  },

  async deleteAll(ctx) {
    const movieActors = await strapi.documents('api::movie-actor.movie-actor').findMany();
    
    for (const movieActor of movieActors) {
      await strapi.documents('api::movie-actor.movie-actor').delete({ 
        documentId: movieActor.documentId 
      });
    }
    
    ctx.body = { message: `${movieActors.length} castings supprimés avec succès` };
  }

 }))
