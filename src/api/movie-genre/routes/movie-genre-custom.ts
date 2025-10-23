export default {
  routes: [
      {
        method: 'GET',
        path: '/movie-genres/movie/:id',
        handler: 'movie-genre.findGenresByMovie',
      config: {
        auth: false,                 
      },
    },
  ],
};
