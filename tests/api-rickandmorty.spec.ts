import { test, expect } from '../fixtures/api';
import {
  type ApiError,
  type Character,
  type Episode,
  type Location,
  type Paginated,
} from '../api/rickandmorty/types';
import { apiUrl, rick, morty, earth, pilotEpisode, pageSize, apiErrors } from '../test-data/rickandmorty';

test.describe('API Rick and Morty', () => {
  test.describe('Raíz', () => {
    test('lista los endpoints disponibles', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getRoot();

      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({
        characters: `${apiUrl}/character`,
        locations: `${apiUrl}/location`,
        episodes: `${apiUrl}/episode`,
      });
    });
  });

  test.describe('Personajes', () => {
    test('obtiene un personaje por id', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getCharacter(rick.id);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const character: Character = await response.json();
      expect(character).toMatchObject({
        id: rick.id,
        name: rick.name,
        status: rick.status,
        species: rick.species,
        gender: rick.gender,
        origin: { name: rick.origin },
      });
    });

    test('la respuesta tiene la estructura esperada', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getCharacter(rick.id);
      const character: Character = await response.json();

      expect(character).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        status: expect.stringMatching(/^(Alive|Dead|unknown)$/),
        species: expect.any(String),
        type: expect.any(String),
        gender: expect.stringMatching(/^(Female|Male|Genderless|unknown)$/),
        origin: { name: expect.any(String), url: expect.any(String) },
        location: { name: expect.any(String), url: expect.any(String) },
        image: expect.stringMatching(/\.jpeg$/),
        episode: expect.arrayContaining([expect.stringContaining('/api/episode/')]),
        url: expect.stringContaining(`/api/character/${rick.id}`),
        created: expect.any(String),
      });
    });

    test('obtiene varios personajes en una sola llamada', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getCharacters([rick.id, morty.id]);

      expect(response.status()).toBe(200);
      const characters: Character[] = await response.json();
      expect(characters.map((c) => c.name)).toEqual([rick.name, morty.name]);
    });

    test('filtra personajes por nombre y estado', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.filterCharacters({ name: 'rick', status: 'Alive' });

      expect(response.status()).toBe(200);
      const { info, results }: Paginated<Character> = await response.json();
      expect(info.count).toBeGreaterThan(0);
      for (const character of results) {
        expect(character.name.toLowerCase()).toContain('rick');
        expect(character.status).toBe('Alive');
      }
    });

    test('pagina los resultados', async ({ rickAndMortyApi }) => {
      const firstPage = await rickAndMortyApi.filterCharacters({ page: 1 });
      const first: Paginated<Character> = await firstPage.json();

      expect(first.results).toHaveLength(pageSize);
      expect(first.info.prev).toBeNull();
      expect(first.info.next).toContain('page=2');

      const secondPage = await rickAndMortyApi.filterCharacters({ page: 2 });
      const second: Paginated<Character> = await secondPage.json();

      expect(second.info.prev).toContain('page=1');
      expect(second.results[0].id).toBe(pageSize + 1);
    });

    test('devuelve 404 si el personaje no existe', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getCharacter(999_999);

      expect(response.status()).toBe(404);
      const body: ApiError = await response.json();
      expect(body.error).toBe(apiErrors.characterNotFound);
    });

    test('devuelve 404 si el filtro no encuentra resultados', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.filterCharacters({ name: 'personaje-que-no-existe' });

      expect(response.status()).toBe(404);
      const body: ApiError = await response.json();
      expect(body.error).toBe(apiErrors.nothingHere);
    });
  });

  test.describe('Ubicaciones', () => {
    test('obtiene una ubicación por id', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getLocation(earth.id);

      expect(response.status()).toBe(200);
      const location: Location = await response.json();
      expect(location).toMatchObject({
        id: earth.id,
        name: earth.name,
        type: earth.type,
        dimension: earth.dimension,
      });
      expect(location.residents.length).toBeGreaterThan(0);
    });
  });

  test.describe('Episodios', () => {
    test('obtiene un episodio y sus personajes', async ({ rickAndMortyApi }) => {
      const response = await rickAndMortyApi.getEpisode(pilotEpisode.id);

      expect(response.status()).toBe(200);
      const episode: Episode = await response.json();
      expect(episode).toMatchObject({
        name: pilotEpisode.name,
        episode: pilotEpisode.code,
        air_date: pilotEpisode.airDate,
      });
      expect(episode.characters).toContain(`${apiUrl}/character/${rick.id}`);
    });
  });
});
