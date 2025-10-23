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
    {
      method: 'GET',
      path: '/movie-actors/movie/:movieId',
      handler: 'movie-actor.findByMovie',
      config: {
        auth: false,
      },
    },
  ],
};