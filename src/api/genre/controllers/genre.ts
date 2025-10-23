/**
 * genre controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::genre.genre',({strapi}) => ({

  // Récupère tous les genres
  async find(ctx) {
    const genres = await strapi.documents('api::genre.genre').findMany();
    if (!genres) {
      ctx.status = 404;
      ctx.body = { error: 'Genres introuvables' };
      return;
    }
    ctx.status = 200;
    ctx.body = genres;
  },

  // Récupère un genre par son documentId
  async findOne(ctx) {
    const { id } = ctx.params;
    const genre = await strapi.documents('api::genre.genre').findOne({ documentId: id });
    if (!genre) {
      ctx.status = 404;
      ctx.body = { error: 'Genre introuvable' };
      return;
    }
    ctx.status = 200;
    ctx.body = genre;
  },

  async deleteAll(ctx) {
    const genres = await strapi.documents('api::genre.genre').findMany();
    for (const genre of genres) {
      await strapi.documents('api::genre.genre').delete({ documentId: genre.documentId });
    }
    ctx.body = { message: `${genres.length} genres supprimés avec succès` };
  },

 }))