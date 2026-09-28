/** URL base con la que la API arma los links de sus recursos */
export const apiUrl = 'https://rickandmortyapi.com/api';

export const rick = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  gender: 'Male',
  origin: 'Earth (C-137)',
} as const;

export const morty = {
  id: 2,
  name: 'Morty Smith',
} as const;

export const earth = {
  id: 1,
  name: 'Earth (C-137)',
  type: 'Planet',
  dimension: 'Dimension C-137',
} as const;

export const pilotEpisode = {
  id: 1,
  name: 'Pilot',
  code: 'S01E01',
  airDate: 'December 2, 2013',
} as const;

/** Cantidad de resultados que devuelve la API por página */
export const pageSize = 20;

export const apiErrors = {
  characterNotFound: 'Character not found',
  nothingHere: 'There is nothing here',
};
