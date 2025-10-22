export type Actor = {
  id: number;
  tmdb_id: number;
  name: string;
  original_name: string;
  gender: number;
  biography: string;
  birthday: string;
  deathday?: string | null;
  place_of_birth: string;
  profile_path: string;
  popularity: number;
  known_for_department: string;
};