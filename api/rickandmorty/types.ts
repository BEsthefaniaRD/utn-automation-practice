/** Tipos de las respuestas de https://rickandmortyapi.com/documentation */

export type ResourceRef = {
  name: string;
  url: string;
};

export type Character = {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: ResourceRef;
  location: ResourceRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
};

export type Location = {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
};

export type Episode = {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
};

export type PageInfo = {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
};

export type Paginated<T> = {
  info: PageInfo;
  results: T[];
};

export type ApiError = {
  error: string;
};

export type CharacterFilters = {
  name?: string;
  status?: Character['status'];
  species?: string;
  gender?: Character['gender'];
  page?: number;
};
