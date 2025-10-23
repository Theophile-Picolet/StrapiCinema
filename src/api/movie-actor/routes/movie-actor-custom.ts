export default {
  routes: [
    {
      method: 'DELETE',
      path: '/movie-actors/delete-all',
      handler: 'movie-actor.deleteAll',
      config: {
        auth: false,
      },
    },
  ],
};