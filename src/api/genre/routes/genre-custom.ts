export default {
  routes: [
    {
      method: 'DELETE',
      path: '/genres/delete-all',
      handler: 'genre.deleteAll',
      config: {
        auth: false,
      },
    },
  ],
};