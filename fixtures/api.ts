import { test as base } from '@playwright/test';
import { RickAndMortyApi } from '../api/rickandmorty/RickAndMortyApi';

type Apis = {
  rickAndMortyApi: RickAndMortyApi;
};

/**
 * `test` extendido para tests de API: cada test recibe el API Object listo
 * para usar. No abre ningún navegador.
 */
export const test = base.extend<Apis>({
  rickAndMortyApi: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: RickAndMortyApi.baseURL });
    await use(new RickAndMortyApi(request));
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
