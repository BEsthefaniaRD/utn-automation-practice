/**
 * Catálogo de casos de prueba: la información que usa el reporte QA
 * (reporters/qa-report.ts) para las columnas Categoría, Criterio de
 * aceptación y Prioridad.
 *
 * La clave es "<archivo> › <título del test>", tal como aparece en
 * `npx playwright test --list`. Si agregas un test nuevo, agrégalo acá;
 * si no, el reporte lo muestra igual pero con el criterio sin definir.
 */
export type Prioridad = 'Alta' | 'Media' | 'Baja';

export type TestCaseInfo = {
  categoria: string;
  criterio: string;
  prioridad: Prioridad;
};

export const testCases: Record<string, TestCaseInfo> = {
  // ── UI: Login (ejemplo sin POM) ───────────────────────────────────────────
  'example-login.spec.ts › Go to the Sauce Demo website': {
    categoria: 'UI - Login (ejemplo)',
    criterio: 'La página de Sauce Demo abre y el título es "Swag Labs".',
    prioridad: 'Baja',
  },
  'example-login.spec.ts › Login with valid credentials': {
    categoria: 'UI - Login (ejemplo)',
    criterio: 'Con standard_user / secret_sauce se redirige a inventory.html.',
    prioridad: 'Baja',
  },
  'example-login.spec.ts › Login with invalid credentials': {
    categoria: 'UI - Login (ejemplo)',
    criterio: 'Con credenciales inválidas se muestra el mensaje de error.',
    prioridad: 'Baja',
  },

  // ── UI: Login (POM) ───────────────────────────────────────────────────────
  'pom-login.spec.ts › Go to the Sauce Demo website': {
    categoria: 'UI - Login',
    criterio: 'La página de login abre y el título es "Swag Labs".',
    prioridad: 'Media',
  },
  'pom-login.spec.ts › Login with valid credentials': {
    categoria: 'UI - Login',
    criterio: 'Con standard_user / secret_sauce se redirige a inventory.html.',
    prioridad: 'Alta',
  },
  'pom-login.spec.ts › Login with invalid credentials': {
    categoria: 'UI - Login',
    criterio: 'Con credenciales inválidas se muestra "Epic sadface: Username and password do not match any user in this service".',
    prioridad: 'Alta',
  },

  // ── UI: Carrito ───────────────────────────────────────────────────────────
  'pom-cart.spec.ts › Agregar un producto al carrito': {
    categoria: 'UI - Carrito',
    criterio: 'El contador del carrito muestra 1 y el carrito contiene el producto agregado.',
    prioridad: 'Alta',
  },
  'pom-cart.spec.ts › Agregar varios productos al carrito': {
    categoria: 'UI - Carrito',
    criterio: 'Al agregar 3 productos el contador muestra 3 y el carrito contiene exactamente esos productos.',
    prioridad: 'Alta',
  },
  'pom-cart.spec.ts › Quitar un producto del carrito': {
    categoria: 'UI - Carrito',
    criterio: 'Al quitar el único producto agregado, el contador del carrito desaparece.',
    prioridad: 'Media',
  },

  // ── Performance ───────────────────────────────────────────────────────────
  'pom-performance.spec.ts › La página de login carga dentro de los tiempos esperados': {
    categoria: 'Performance',
    criterio: 'TTFB < 1.500 ms, DOMContentLoaded < 3.000 ms, Load < 5.000 ms y FCP < 3.000 ms.',
    prioridad: 'Alta',
  },
  'pom-performance.spec.ts › Largest Contentful Paint de la página de login': {
    categoria: 'Performance',
    criterio: 'Largest Contentful Paint < 4.000 ms (solo Chromium).',
    prioridad: 'Media',
  },
  'pom-performance.spec.ts › El login lleva al listado de productos rápidamente': {
    categoria: 'Performance',
    criterio: 'Desde el click en Login hasta ver el listado de productos < 3.000 ms.',
    prioridad: 'Alta',
  },
  'pom-performance.spec.ts › Agregar al carrito y abrir el carrito responden rápido': {
    categoria: 'Performance',
    criterio: 'Agregar un producto < 1.000 ms y abrir el carrito < 2.000 ms.',
    prioridad: 'Media',
  },
  'pom-performance.spec.ts › Detecta el login lento de performance_glitch_user': {
    categoria: 'Performance',
    criterio: 'El login de performance_glitch_user supera los 3.000 ms (la medición detecta la demora).',
    prioridad: 'Baja',
  },

  // ── API: Rick and Morty ───────────────────────────────────────────────────
  'api-rickandmorty.spec.ts › lista los endpoints disponibles': {
    categoria: 'API - Raíz',
    criterio: 'GET /api responde 200 con las URLs de character, location y episode.',
    prioridad: 'Media',
  },
  'api-rickandmorty.spec.ts › obtiene un personaje por id': {
    categoria: 'API - Personajes',
    criterio: 'GET /character/1 responde 200 en JSON con los datos de Rick Sanchez.',
    prioridad: 'Alta',
  },
  'api-rickandmorty.spec.ts › la respuesta tiene la estructura esperada': {
    categoria: 'API - Personajes',
    criterio: 'Todos los campos del personaje existen y tienen el tipo y los valores permitidos.',
    prioridad: 'Alta',
  },
  'api-rickandmorty.spec.ts › obtiene varios personajes en una sola llamada': {
    categoria: 'API - Personajes',
    criterio: 'GET /character/1,2 responde 200 con Rick Sanchez y Morty Smith, en ese orden.',
    prioridad: 'Media',
  },
  'api-rickandmorty.spec.ts › filtra personajes por nombre y estado': {
    categoria: 'API - Personajes',
    criterio: 'Con name=rick y status=Alive todos los resultados contienen "rick" y están vivos.',
    prioridad: 'Alta',
  },
  'api-rickandmorty.spec.ts › pagina los resultados': {
    categoria: 'API - Personajes',
    criterio: '20 resultados por página, links next/prev correctos y la página 2 empieza en el id 21.',
    prioridad: 'Media',
  },
  'api-rickandmorty.spec.ts › devuelve 404 si el personaje no existe': {
    categoria: 'API - Personajes',
    criterio: 'Un id inexistente responde 404 con el error "Character not found".',
    prioridad: 'Alta',
  },
  'api-rickandmorty.spec.ts › devuelve 404 si el filtro no encuentra resultados': {
    categoria: 'API - Personajes',
    criterio: 'Un filtro sin resultados responde 404 con el error "There is nothing here".',
    prioridad: 'Media',
  },
  'api-rickandmorty.spec.ts › obtiene una ubicación por id': {
    categoria: 'API - Ubicaciones',
    criterio: 'GET /location/1 responde 200 con Earth (C-137), tipo Planet, y tiene residentes.',
    prioridad: 'Media',
  },
  'api-rickandmorty.spec.ts › obtiene un episodio y sus personajes': {
    categoria: 'API - Episodios',
    criterio: 'GET /episode/1 responde 200 con "Pilot" (S01E01) e incluye a Rick entre sus personajes.',
    prioridad: 'Media',
  },
};
