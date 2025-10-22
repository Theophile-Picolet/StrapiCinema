import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Actor Schema Validation', () => {
  let actorSchema: Record<string, unknown>;

  beforeAll(() => {
    // Charger le schéma Actor depuis le fichier JSON
    const schemaPath = path.join(__dirname, '../../src/api/actor/content-types/actor/schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    actorSchema = JSON.parse(schemaContent);
  });

  describe('Structure de base du schéma', () => {
    it('devrait avoir les propriétés de base requises', () => {
      expect(actorSchema).toHaveProperty('kind');
      expect(actorSchema).toHaveProperty('collectionName');
      expect(actorSchema).toHaveProperty('info');
      expect(actorSchema).toHaveProperty('options');
      expect(actorSchema).toHaveProperty('attributes');
    });

    it('devrait être de type collectionType', () => {
      expect(actorSchema.kind).toBe('collectionType');
    });

    it('devrait avoir le bon nom de collection', () => {
      expect(actorSchema.collectionName).toBe('actors');
    });

    it('devrait avoir les informations correctes', () => {
      const info = actorSchema.info as Record<string, unknown>;
      expect(info.singularName).toBe('actor');
      expect(info.pluralName).toBe('actors');
      expect(info.displayName).toBe('Actor');
    });

    it('devrait avoir draftAndPublish activé', () => {
      const options = actorSchema.options as Record<string, unknown>;
      expect(options.draftAndPublish).toBe(true);
    });
  });

  describe('Attributs du schéma', () => {
    it('devrait avoir tous les attributs requis', () => {
      const expectedAttributes = [
        'slug',
        'tmdb_id',
        'name',
        'original_name',
        'gender',
        'biography',
        'birthday',
        'deathday',
        'place_of_birth',
        'profile_path',
        'popularity',
        'known_for_department',
        'actors'
      ];

      const attributes = actorSchema.attributes as Record<string, unknown>;
      for (const attr of expectedAttributes) {
        expect(attributes).toHaveProperty(attr);
      }
    });

    it('devrait avoir les bons types pour les attributs de base', () => {
      const attributes = actorSchema.attributes as Record<string, Record<string, unknown>>;
      expect(attributes.slug.type).toBe('uid');
      expect(attributes.tmdb_id.type).toBe('integer');
      expect(attributes.name.type).toBe('string');
      expect(attributes.original_name.type).toBe('string');
      expect(attributes.gender.type).toBe('integer');
      expect(attributes.biography.type).toBe('string');
      expect(attributes.birthday.type).toBe('date');
      expect(attributes.deathday.type).toBe('date');
      expect(attributes.place_of_birth.type).toBe('string');
      expect(attributes.profile_path.type).toBe('string');
      expect(attributes.popularity.type).toBe('integer');
      expect(attributes.known_for_department.type).toBe('string');
    });

    it('devrait avoir les bonnes relations', () => {
      const attributes = actorSchema.attributes as Record<string, Record<string, unknown>>;
      // Relation avec movie-actor
      expect(attributes.actors.type).toBe('relation');
      expect(attributes.actors.relation).toBe('oneToMany');
      expect(attributes.actors.target).toBe('api::movie-actor.movie-actor');
      expect(attributes.actors.mappedBy).toBe('actor');
    });
  });

  describe('Validation de la structure JSON', () => {
    it('devrait être un JSON valide', () => {
      expect(() => JSON.stringify(actorSchema)).not.toThrow();
    });

    it('devrait avoir une structure cohérente', () => {
      // Vérifier que tous les attributs ont au moins un type
      const attributes = actorSchema.attributes as Record<string, Record<string, unknown>>;
      for (const attr of Object.keys(attributes)) {
        expect(attributes[attr]).toHaveProperty('type');
      }
    });
  });

  describe('Tests de validation des données', () => {
    it('devrait valider un objet actor correct', () => {
      const validActor = {
        slug: "leonardo-dicaprio",
        tmdb_id: 6193,
        name: "Leonardo DiCaprio",
        original_name: "Leonardo DiCaprio",
        gender: 2,
        biography: "Leonardo Wilhelm DiCaprio is an American actor and film producer...",
        birthday: "1974-11-11",
        deathday: null,
        place_of_birth: "Los Angeles, California, USA",
        profile_path: "/path/to/profile.jpg",
        popularity: 85,
        known_for_department: "Acting"
      };

      const attributes = actorSchema.attributes as Record<string, unknown>;
      for (const field of Object.keys(validActor)) {
        expect(attributes).toHaveProperty(field);
      }
    });
  });
});
