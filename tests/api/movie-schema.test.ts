import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Movie Schema Validation', () => {
  let movieSchema: any;

  beforeAll(() => {
    // Charger le schéma Movie depuis le fichier JSON
    const schemaPath = path.join(__dirname, '../../src/api/movie/content-types/movie/schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    movieSchema = JSON.parse(schemaContent);
  });

  describe('Structure de base du schéma', () => {
    it('devrait avoir les propriétés de base requises', () => {
      expect(movieSchema).toHaveProperty('kind');
      expect(movieSchema).toHaveProperty('collectionName');
      expect(movieSchema).toHaveProperty('info');
      expect(movieSchema).toHaveProperty('options');
      expect(movieSchema).toHaveProperty('attributes');
    });

    it('devrait être de type collectionType', () => {
      expect(movieSchema.kind).toBe('collectionType');
    });

    it('devrait avoir le bon nom de collection', () => {
      expect(movieSchema.collectionName).toBe('movies');
    });

    it('devrait avoir les informations correctes', () => {
      expect(movieSchema.info.singularName).toBe('movie');
      expect(movieSchema.info.pluralName).toBe('movies');
      expect(movieSchema.info.displayName).toBe('Movie');
    });

    it('devrait avoir draftAndPublish activé', () => {
      expect(movieSchema.options.draftAndPublish).toBe(true);
    });
  });

  describe('Attributs du schéma', () => {
    it('devrait avoir tous les attributs requis', () => {
      const expectedAttributes = [
        'title',
        'description', 
        'text',
        'director',
        'release_date',
        'runtime',
        'poster_path',
        'backdrop_path',
        'vote_average',
        'vote_count',
        'movie_genres',
        'movies',
        'slug'
      ];

      for (const attr of expectedAttributes) {
        expect(movieSchema.attributes).toHaveProperty(attr);
      }
    });

    it('devrait avoir les bons types pour les attributs de base', () => {
      expect(movieSchema.attributes.title.type).toBe('string');
      expect(movieSchema.attributes.description.type).toBe('string');
      expect(movieSchema.attributes.text.type).toBe('string');
      expect(movieSchema.attributes.director.type).toBe('string');
      expect(movieSchema.attributes.release_date.type).toBe('date');
      expect(movieSchema.attributes.runtime.type).toBe('integer');
      expect(movieSchema.attributes.poster_path.type).toBe('string');
      expect(movieSchema.attributes.backdrop_path.type).toBe('string');
      expect(movieSchema.attributes.vote_average.type).toBe('integer');
      expect(movieSchema.attributes.vote_count.type).toBe('integer');
      expect(movieSchema.attributes.slug.type).toBe('uid');
    });

    it('devrait avoir les bonnes relations', () => {
      // Relation avec movie-genre
      expect(movieSchema.attributes.movie_genres.type).toBe('relation');
      expect(movieSchema.attributes.movie_genres.relation).toBe('oneToMany');
      expect(movieSchema.attributes.movie_genres.target).toBe('api::movie-genre.movie-genre');
      expect(movieSchema.attributes.movie_genres.mappedBy).toBe('movie');

      // Relation avec movie-actor
      expect(movieSchema.attributes.movies.type).toBe('relation');
      expect(movieSchema.attributes.movies.relation).toBe('oneToMany');
      expect(movieSchema.attributes.movies.target).toBe('api::movie-actor.movie-actor');
      expect(movieSchema.attributes.movies.mappedBy).toBe('movie');
    });
  });

  describe('Validation de la structure JSON', () => {
    it('devrait être un JSON valide', () => {
      expect(() => JSON.stringify(movieSchema)).not.toThrow();
    });

    it('devrait avoir une structure cohérente', () => {
      // Vérifier que tous les attributs ont au moins un type
      for (const attr of Object.keys(movieSchema.attributes)) {
        expect(movieSchema.attributes[attr]).toHaveProperty('type');
      }
    });
  });

  describe('Tests de validation des données', () => {
    it('devrait valider un objet movie correct', () => {
      const validMovie = {
        title: "Test Movie",
        description: "A test movie",
        text: "Movie content",
        director: "Test Director",
        release_date: "2023-01-01",
        runtime: 120,
        poster_path: "/path/to/poster.jpg",
        backdrop_path: "/path/to/backdrop.jpg",
        vote_average: 8,
        vote_count: 100,
        slug: "test-movie"
      };

      // Vérifier que tous les champs requis existent
      for (const field of Object.keys(validMovie)) {
        expect(movieSchema.attributes).toHaveProperty(field);
      }
    });
  });
});
