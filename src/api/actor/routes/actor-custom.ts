export default {
  routes: [
    {
      method: 'DELETE',
      path: '/actors/delete-all',
      handler: 'actor.deleteAll',
      config: {
        auth: false,
      },
    },
  ],
};