# INFORME_PRUEBAS.md — App de usuarios

Resumen del taller de pruebas automatizadas sobre la API y la web de la App de
usuarios (Vitest, Supertest, Vue Test Utils, Playwright y TestSprite).

## 1. Resumen por proyecto y tipo de prueba

| Proyecto | Herramienta | Tipo de prueba | Pruebas | Pasan | Fallan | Cobertura |
| --- | --- | --- | --- | --- | --- | --- |
| API | Vitest + Supertest + mongodb-memory-server | Unitarias e integración | 73 | 73 | 0 | — |
| API | @vitest/coverage-v8 | Cobertura | — | — | — | 97.87% líneas · 96.96% sentencias · 100% funciones · 91.95% ramas |
| Web | Vitest + Vue Test Utils + jsdom | Unitarias y de componentes | 78 | 78 | 0 | — |
| Web | @vitest/coverage-v8 | Cobertura | — | — | — | 91.10% líneas · 90.08% sentencias · 86.52% funciones · 77.59% ramas |
| Web + API | Playwright | End-to-end (Chromium y Firefox) | 21 | 21 | 0 | — |
| Web | @axe-core/playwright | Accesibilidad (Chromium y Firefox) | 3 | 3 | 0 | — |
| API | TestSprite (IA) | Backend | 10 | 10 | 0 | — |
| Web | TestSprite (IA) | Frontend | 15 | 15 | 0 | — |

Todos los umbrales de cobertura se cumplen con holgura (mínimos: 80% líneas/funciones/
sentencias y 70% ramas) y ambos proyectos superan el 90% de cobertura de líneas.

## 2. Errores y comportamientos dudosos encontrados

1. **Credenciales de administrador incorrectas en los casos generados por TestSprite.**
   Los casos de CRUD administrativo generados por la IA usaban credenciales por
   defecto (`admin@example.com` / `Admin12345`) en lugar de las del seed, por lo que
   el login devolvía `401` y dos pruebas fallaban. **Decisión:** se re-ejecutaron
   indicando las cuentas del seed (`admin@demo.com` / `Admin123!`); pasaron las dos.
   No se cambió código (era un problema de configuración del entorno).

2. **El borrado lógico impide reutilizar el email de un usuario eliminado.**
   Al eliminar un usuario se pone `estado: false`, pero su email sigue ocupando el
   índice único; un registro posterior con ese email responde `400` por email
   duplicado. **Decisión:** se documentó como limitación de diseño en el PRD y no se
   cambió (comportamiento esperado).

3. **El cierre de sesión no revoca el JWT en el servidor.**
   `logout` solo elimina el token del `localStorage`; un token copiado sigue siendo
   válido hasta su expiración. **Decisión:** se documentó como limitación conocida;
   no se cambió por quedar fuera del alcance del taller.

## 3. Análisis de TestSprite

### Primera ejecución — casos fallidos

| Caso | Descripción | Resultado | Causa | Decisión |
| --- | --- | --- | --- | --- |
| TC009 (API) | Listar usuarios con token de administrador | Falló (`No admin credentials available`) | Problema de entorno: las pruebas no recibieron `ADMIN_EMAIL`/`ADMIN_PASSWORD` | Se re-ejecutó con las cuentas del seed |
| TC010 (API) | Eliminar usuario con token de administrador | Falló (login admin `401`) | Las credenciales por defecto (`admin@example.com` / `Admin12345`) no coinciden con el seed | Se re-ejecutó con `admin@demo.com` / `Admin123!` |

### Segunda ejecución

| Proyecto | Resultado |
| --- | --- |
| API (backend, puerto 3000) | 10/10 aprobadas |
| Web (frontend, puerto 5173) | 15/15 aprobadas (limitado a 15 casos de alta prioridad por servidor de desarrollo) |

## 4. Comparación entre TestSprite y las pruebas escritas a mano

TestSprite generó por sí solo un PRD estandarizado y un resumen del código, y validó
los flujos principales (health, autenticación, listado de usuarios y borrado lógico)
a nivel de API, y los flujos de navegación, login, registro, perfil, búsqueda y filtro
a nivel de la web, detectando de paso limitaciones del proyecto (email no reutilizable
tras el borrado lógico, ausencia de rate limiting y tokens no revocados al cerrar
sesión). Sin embargo, su plan cubrió un subconjunto de los casos de aceptación: no
profundizó en las validaciones granulares que sí cubren las pruebas escritas a mano
(límite de paginación `limite=51`, JSON mal formado, unicidad de email, cambio de rol
propio, auto-eliminación, guardas 401/403 y las reglas de contraseña de cada campo).
Además, sus pruebas de administración dependieron de credenciales externas que hubo que
configurar, algo que no ocurre con las pruebas de Supertest, que crean sus propios
usuarios y tokens con `mongodb-memory-server`. En la práctica conviene combinar ambos
enfoques: las pruebas deterministas (Vitest/Supertest/Playwright) garantizan las reglas
de negocio exactas y la regresión en cada commit, mientras que TestSprite aporta una
segunda revisión independiente, detecta escenarios y limitaciones no previstos y
compara el comportamiento real con los requisitos documentados.

## 5. Líneas sin cubrir del reporte de cobertura

- **API `app.js` (86.95% líneas, sin cubrir `19-20` y `56`):**
  - `19-20` es el logger de peticiones y `56` el log de errores; ambos solo se ejecutan cuando `NODE_ENV !== "test"`. En las pruebas `NODE_ENV` siempre es `test` (definido en `vitest.config.js`), por lo que esas líneas nunca se ejecutan (comportamiento esperado). El resto del middleware de errores (`err.code === 11000`, `ValidationError` y el `500` genérico) quedó cubierto con pruebas de integración que simulan fallos de base de datos.

- **Web `AppHeader.vue` (83.33% líneas, sin cubrir `29` y `47-50`):**
  - Son líneas de plantilla del enlace de marca y de los enlaces de navegación. Se añadieron pruebas para la alternancia del menú móvil y para las iniciales del usuario; las líneas restantes corresponden a nodos de plantilla que los tests de componente no llegan a ejercitar.

En ambos casos se trata de código defensivo (logs deshabilitados en test) o de
maquetación; los umbrales se cumplen con holgura: API 97.87% y web 91.10% de líneas.

## 6. Evidencias

| Evidencia | Archivo |
| --- | --- |
| `npm test` de la API (captura de terminal) | [`evidencias/coverage/api/api-tests.png`](evidencias/coverage/api/api-tests.png) |
| `npm test` de la web (captura de terminal) | [`evidencias/coverage/web/web-tests.png`](evidencias/coverage/web/web-tests.png) |
| Resumen de cobertura en terminal (API) | [`evidencias/coverage/api/api-coverage-terminal.png`](evidencias/coverage/api/api-coverage-terminal.png) |
| Resumen de cobertura en terminal (web) | [`evidencias/coverage/web/web-coverage-terminal.png`](evidencias/coverage/web/web-coverage-terminal.png) |
| Cobertura API (resumen JSON) | [`evidencias/coverage/api/api-coverage-summary.json`](evidencias/coverage/api/api-coverage-summary.json) |
| Cobertura web (resumen JSON) | [`evidencias/coverage/web/web-coverage-summary.json`](evidencias/coverage/web/web-coverage-summary.json) |
| Reporte HTML de cobertura API | [`evidencias/coverage/api/api-coverage-report.png`](evidencias/coverage/api/api-coverage-report.png) |
| Líneas sin cubrir (API, `app.js`) | [`evidencias/coverage/api/api-app-uncovered.png`](evidencias/coverage/api/api-app-uncovered.png) |
| Reporte HTML de cobertura web | [`evidencias/coverage/web/web-coverage-report.png`](evidencias/coverage/web/web-coverage-report.png) |
| Líneas sin cubrir (web, `AppHeader.vue`) | [`evidencias/coverage/web/web-appheader-uncovered.png`](evidencias/coverage/web/web-appheader-uncovered.png) |
| Reporte de Playwright | [`evidencias/playwright/playwright-report.png`](evidencias/playwright/playwright-report.png) |
| Reporte TestSprite API | [`evidencias/testsprite/api/testsprite-mcp-test-report.md`](evidencias/testsprite/api/testsprite-mcp-test-report.md) |
| Reporte TestSprite web | [`evidencias/testsprite/web/testsprite-mcp-test-report.md`](evidencias/testsprite/web/testsprite-mcp-test-report.md) |
| Panel de TestSprite | [`evidencias/testsprite/panel.png`](evidencias/testsprite/panel.png) |
