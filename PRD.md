# PRD — App de usuarios (API y web)

## Objetivo

Aplicación de gestión de usuarios con autenticación JWT. La API REST expone registro,
login, perfil, cambio de contraseña y un CRUD de usuarios para administradores. La web
(Vue 3 + Vite + Vue Router) consume la API, guarda el token en `localStorage` y protege
las rutas según la sesión y el rol.

## URLs de ejecución

| Servicio | URL |
| --- | --- |
| API | http://localhost:3000/api |
| Web | http://localhost:5173 |
| Health check | GET http://localhost:3000/api/health → `200 { "status": "ok" }` |

## Roles y permisos

- `usuario`: puede ver y editar su propio nombre/email, cambiar su contraseña y cerrar sesión.
- `admin`: además puede listar, buscar, filtrar, crear, editar y eliminar (borrado lógico) usuarios.
- El registro público **siempre** crea usuarios con rol `usuario`, aunque se envíe `rol: "admin"`.
- Un usuario con rol `usuario` que intenta acceder a `/usuarios` es redirigido a `/perfil`.
- Sin sesión, las rutas protegidas redirigen a `/login`.

## Reglas de contraseña

- Mínimo 8 caracteres.
- Al menos una letra mayúscula.
- Al menos una letra minúscula.
- Al menos un número.
- El login con email inexistente y con contraseña incorrecta devuelve el mismo mensaje:
  `Credenciales inválidas` (401).
- Un usuario con `estado: false` (borrado lógico) no puede iniciar sesión (401).

## Endpoints de autenticación (`/api/auth`)

| Método | Ruta | Acceso | Descripción | Respuesta esperada |
| --- | --- | --- | --- | --- |
| POST | `/registro` | Público | Crea una cuenta con rol `usuario` | `201` con `token` y `usuario` (sin `password`) |
| POST | `/login` | Público | Inicia sesión | `200` con `token` y `usuario.uid` |
| GET | `/perfil` | Token | Devuelve el usuario autenticado | `200`; sin token o token inválido `401` |
| PUT | `/perfil` | Token | Actualiza nombre y email propios | `200` |
| PUT | `/password` | Token | Cambia la contraseña | `200`; contraseña actual incorrecta o nueva igual a la actual `400` |

## Endpoints del CRUD de usuarios (`/api/usuarios`)

Todas las rutas requieren token. Las rutas de administración requieren rol `admin`
(sin token `401`, con rol `usuario` `403`).

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Lista activos con `total`, `pagina`, `limite`, `totalPaginas`, `usuarios` |
| GET | `/?buscar=&rol=&pagina=&limite=` | Búsqueda por nombre/email, filtro por rol y paginación |
| GET | `/:id` | Obtiene un usuario; id mal formado `400`, inexistente/eliminado `404` |
| POST | `/` | Crea un usuario; la contraseña se guarda hasheada |
| PUT | `/:id` | Actualiza parcialmente; `password` vacía no se cambia |
| DELETE | `/:id` | Borrado lógico (`estado: false`) |

## Reglas de negocio

- Un administrador **no puede cambiar su propio rol** (`400`).
- Un administrador **no puede eliminarse a sí mismo** (`400`).
- El listado solo muestra usuarios activos (`estado: true`).
- Límite de paginación: máximo 50; `limite=51` responde `400`.
- El borrado es lógico: el usuario deja de aparecer en el listado y ya no puede iniciar sesión.
- El email es único; un email duplicado responde `400` con errores cuyo `path` es `email`.
- JSON mal formado responde `400` con `El cuerpo de la petición no es un JSON válido`.
- Una ruta inexistente responde `404 { "error": "Ruta no encontrada" }`.

## Reglas de la interfaz

- Atributos `data-test` disponibles: `login-email`, `login-password`, `login-submit`,
  `login-form`, `register-name`, `register-email`, `register-password`,
  `register-confirmation`, `register-submit`, `profile-role`, `profile-name`,
  `profile-email`, `password-current`, `password-new`, `password-confirmation`,
  `password-submit`, `users-search`, `users-role-filter`, `users-new`, `users-total`,
  `users-table`, `user-row`, `user-edit`, `user-delete`, `confirm-dialog`,
  `confirm-accept`, `confirm-cancel`, `pagination-info`, `pagination-page`,
  `pagination-prev`, `pagination-next`, `logout`, `current-user-name`.
- Las notificaciones usan `data-test="toast"` y los errores visibles `data-test="alert"`.
- El inicio de sesión inválido muestra `Credenciales inválidas` y permanece en `/login`.
- El registro exitoso entra a `/perfil` y el rol mostrado es `Usuario`.
- El admin puede crear un usuario, encontrarlo con `users-search` y editarlo.
- El admin elimina usuarios con el diálogo de confirmación (`confirm-accept`).
- El filtro por rol y la paginación actualizan el listado; `pagination-info` cambia al cambiar de página.
- El usuario puede cambiar su contraseña desde `/perfil`, cerrar sesión e iniciar con la nueva.
- Una ruta inexistente muestra la página "Página no encontrada".

## Cuentas de prueba (seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | `admin@demo.com` | `Admin123!` |
| Usuario | `ana@demo.com` | `Usuario123` |
| Usuario | `luis@demo.com` | `Usuario123` |
| Admin | `marta@demo.com` | `Usuario123` |
| Usuario desactivado | `pedro@demo.com` | `Usuario123` |

## Criterios de aceptación para TestSprite

1. Login correcto de administrador y acceso al listado de usuarios.
2. Login incorrecto muestra el mensaje de credenciales inválidas.
3. Registro público crea rol `usuario` y entra al perfil.
4. Validación de contraseña débil en registro (`400`).
5. CRUD de usuarios: crear, consultar, actualizar, buscar, filtrar, paginar y eliminar.
6. Control de acceso: `401` sin token, `403` con rol usuario, `200` con admin.
7. Reglas de negocio: admin no cambia su rol ni se elimina; borrado lógico impide login.
8. Cambio de contraseña con validación de la contraseña actual.
