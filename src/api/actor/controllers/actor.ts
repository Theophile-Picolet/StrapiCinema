/**
 * actor controller
 */


import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::actor.actor', ({ strapi }) => ({

  // GET /api/actors
  async find(ctx) {
    const actors = await strapi.documents('api::actor.actor').findMany();
    ctx.body = actors;
  },

  // Récupere un acteur par son documentId
  async findOne(ctx) {
    const { id } = ctx.params;
    const actor = await strapi.documents('api::actor.actor').findOne({ documentId: id });
    if (!actor) return ctx.notFound('Acteur introuvable');
    ctx.body = actor;
  },


  // DELETE /api/actors/:id
  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.documents('api::actor.actor').delete({ documentId: id });
    ctx.body = { ok: true };
  },

  async deleteAll(ctx) {
    const actors = await strapi.documents('api::actor.actor').findMany();
    for (const actor of actors) {
      await strapi.documents('api::actor.actor').delete({ documentId: actor.documentId });
    }
    ctx.body = { message: `${actors.length} acteurs supprimés avec succès` };
  },
}));
