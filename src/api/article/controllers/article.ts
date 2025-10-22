/**
 *  article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article',({strapi})=>({
  async find(ctx) {
 

    console.log("strapi",strapi);
console.log("ctx",ctx);
console.log("params requete", ctx.query)
    // your custom logic for modifying the input
    ctx.query = { ...ctx.query, locale: "en" }; // force ctx.query.locale to 'en' regardless of what was requested

    // Call the default parent controller action
    const result = await super.find(ctx);

    // your custom logic for modifying the output
    result.meta.date = Date.now(); // change the date that is returned
console.log("result",result);
    return result;
  },

}));
