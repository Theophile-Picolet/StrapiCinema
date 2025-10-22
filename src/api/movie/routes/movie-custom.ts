export default {
  routes: [
    {
      method: 'GET',
      path: '/movies/from-title',
      handler: 'movie.fromTitle',   
      config: {
        auth: false,                 
      },
    },
    {
      method: 'DELETE',
      path: '/movies/delete-all',
      handler: 'movie.deleteAll',   
      config: {
        auth: false,                 
      },
    },
  ],
};
