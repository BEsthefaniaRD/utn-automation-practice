import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type CharacterFilters } from './types';

/**
 * API Object: agrupa las llamadas a la API de Rick and Morty,
 * igual que un Page Object agrupa las acciones de una página.
 * Devuelve la respuesta completa para que el test verifique status y body.
 */
export class RickAndMortyApi {
  /** Termina en "/" para que las rutas relativas ('character/1') se sumen a /api/ */
  static readonly baseURL = 'https://rickandmortyapi.com/api/';

  constructor(private readonly request: APIRequestContext) {}

  getRoot(): Promise<APIResponse> {
    return this.request.get('');
  }

  getCharacter(id: number): Promise<APIResponse> {
    return this.request.get(`character/${id}`);
  }

  /** Varios personajes en una sola llamada: character/1,2,3 */
  getCharacters(ids: number[]): Promise<APIResponse> {
    return this.request.get(`character/${ids.join(',')}`);
  }

  filterCharacters(filters: CharacterFilters = {}): Promise<APIResponse> {
    return this.request.get('character/', { params: filters });
  }

  getLocation(id: number): Promise<APIResponse> {
    return this.request.get(`location/${id}`);
  }

  getEpisode(id: number): Promise<APIResponse> {
    return this.request.get(`episode/${id}`);
  }
}
