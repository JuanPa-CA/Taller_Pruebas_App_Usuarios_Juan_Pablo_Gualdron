# App de usuarios — Taller de Pruebas de Software

Aplicación de gestión de usuarios con autenticación JWT. Consta de una **API REST**
(Node.js, Express, MongoDB, Mongoose y JWT) y una **web** (Vue 3, Vite y Vue Router)
que consume la API, guarda el token en `localStorage` y protege las rutas según la
sesión y el rol.

Este repositorio incluye las pruebas automatizadas del taller:

- **Unitarias e integración de la API** con Vitest, Supertest y `mongodb-memory-server`.
- **Unitarias y de componentes de la web** con Vitest, Vue Test Utils y jsdom.
- **End-to-end** con Playwright (Chromium y Firefox).
- **Pruebas generadas con IA** con TestSprite (backend y frontend).

Las evidencias (reportes, capturas y archivos generados) están en [`evidencias/`](evidencias/).

## Integrantes

- Juan Pablo Gualdrón

## Requisitos

- Node.js 22 o superior.
- MongoDB local **solo** para ejecutar la API con datos reales y las pruebas E2E.
  Las pruebas de Vitest no lo necesitan (usan `mongodb-memory-server`).

## Estructura

```
app-usuarios/
├── api/           → API REST (Express + Mongoose + JWT)
│   ├── app.js     → crea y exporta la app de Express (sin listen)
│   ├── server.js  → conecta la BD y levanta el servidor
│   └── tests/     → setup.js, helpers.js, unit/ e integration/
├── web/           → Vue 3 + Vite + Vue Router
│   ├── src/       → código de la aplicación
│   ├── tests/unit/→ pruebas unitarias y de componentes
│   └── e2e/       → flujos end-to-end con Playwright
├── evidencias/    → cobertura, Playwright y TestSprite
├── PRD.md         → requisitos del proyecto
└── INFORME_PRUEBAS.md
```

## Instalación y ejecución

### API (puerto 3000)

```powershell
cd api
npm install
# crear api/.env a partir de .env.example (PUERTO, MONGODB_CNX y JWT_SECRET)
npm run seed      # carga los usuarios de prueba
npm run dev       # API en http://localhost:3000/api
```

### Web (puerto 5173)

```powershell
cd web
npm install
npm run dev       # web en http://localhost:5173
```

## Cómo ejecutar cada tipo de prueba

| Tipo | Comando | Dónde |
| --- | --- | --- |
| Unitarias e integración de la API | `npm test` | `api/` |
| Cobertura de la API | `npm run coverage` | `api/` |
| Unitarias y de componentes de la web | `npm test` | `web/` |
| Cobertura de la web | `npm run coverage` | `web/` |
| End-to-end (Chromium y Firefox) | `npm run test:e2e` | `web/` |
| Reporte HTML de Playwright | `npx playwright show-report` | `web/` |
| Pruebas con IA (TestSprite) | vía MCP del IDE | `api/` y `web/` |

> `npm run test:e2e` levanta la API con la base de datos aparte `app-usuarios-e2e`
> (ejecuta `npm run seed` y `npm start` con `MONGODB_CNX` apuntando a esa base),
> por lo que nunca toca la base de desarrollo.

## Cuentas de prueba (seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | `admin@demo.com` | `Admin123!` |
| Usuario | `ana@demo.com` | `Usuario123` |
| Usuario | `luis@demo.com` | `Usuario123` |
| Admin | `marta@demo.com` | `Usuario123` |
| Usuario (desactivado) | `pedro@demo.com` | `Usuario123` |

## Herramientas

- **Vitest** — ejecutor de pruebas y cobertura (API y web).
- **Supertest** — integración HTTP de la API sin levantar el servidor.
- **mongodb-memory-server** — base de datos MongoDB en memoria para las pruebas.
- **Vue Test Utils + jsdom** — montaje de componentes y simulación del usuario.
- **Playwright** — flujos end-to-end en un navegador real.
- **@vitest/coverage-v8** — reporte de cobertura (consola y HTML).
- **TestSprite** — generación y ejecución de casos de prueba con IA.
