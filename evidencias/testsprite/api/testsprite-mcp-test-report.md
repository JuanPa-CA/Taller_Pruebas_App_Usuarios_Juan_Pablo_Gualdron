
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** app-usuarios
- **Date:** 2026-10-26
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### Requirement: Health check
- **Description:** Endpoint público para verificar que la API está operativa.

#### Test TC001 get api health returns status ok
- **Test Code:** [TC001_get_api_health_returns_status_ok.py](./TC001_get_api_health_returns_status_ok.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/2fbd96cc-5198-4d18-aa95-0ccf7f84c53d
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** `GET /api/health` responde `200` con `{"status":"ok"}` y content-type JSON, tal como especifica el PRD.
---

### Requirement: Authentication
- **Description:** Registro público, login y gestión de perfil/contraseña con JWT (header `x-token`).

#### Test TC002 post api auth registro with valid data creates usuario role user
- **Test Code:** [TC002_post_api_auth_registro_with_valid_data_creates_usuario_role_user.py](./TC002_post_api_auth_registro_with_valid_data_creates_usuario_role_user.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/631b0fb8-9600-491c-bd39-11eb0ef4056d
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El registro con datos válidos devuelve `201`, `token` y `usuario` con `rol: "usuario"`, `estado: true` y sin exponer `password`.
---

#### Test TC003 post api auth registro with weak password returns validation error
- **Test Code:** [TC003_post_api_auth_registro_with_weak_password_returns_validation_error.py](./TC003_post_api_auth_registro_with_weak_password_returns_validation_error.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/c8e4a66e-b2e1-428e-aca3-273d6e1e5356
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Una contraseña débil es rechazada con `400` y errores de validación, cumpliendo las reglas de complejidad.
---

#### Test TC004 post api auth login with valid credentials returns token and usuario
- **Test Code:** [TC004_post_api_auth_login_with_valid_credentials_returns_token_and_usuario.py](./TC004_post_api_auth_login_with_valid_credentials_returns_token_and_usuario.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/0c703b1f-f019-4966-8797-ac1fe5909169
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El login con credenciales válidas devuelve `200`, `token` y `usuario` con `uid`, tal como se espera.
---

#### Test TC005 post api auth login with invalid credentials returns 401 error
- **Test Code:** [TC005_post_api_auth_login_with_invalid_credentials_returns_401_error.py](./TC005_post_api_auth_login_with_invalid_credentials_returns_401_error.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/3f5a9f52-f3a4-487e-a3d7-10986a6f50c2
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El login con credenciales inválidas devuelve `401` con el mensaje `Credenciales inválidas`, sin filtrar información.
---

#### Test TC006 get api auth perfil with valid token returns authenticated user
- **Test Code:** [TC006_get_api_auth_perfil_with_valid_token_returns_authenticated_user.py](./TC006_get_api_auth_perfil_with_valid_token_returns_authenticated_user.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/958cc531-bebf-4b08-a7d8-c826e737a699
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** `GET /api/auth/perfil` con `x-token` válido devuelve `200` con el perfil del usuario autenticado.
---

#### Test TC007 put api auth perfil updates nombre and email with uniqueness check
- **Test Code:** [TC007_put_api_auth_perfil_updates_nombre_and_email_with_uniqueness_check.py](./TC007_put_api_auth_perfil_updates_nombre_and_email_with_uniqueness_check.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/bf2b0d23-af0f-432c-9dc2-e6081c0f5a6c
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Actualización de nombre/email propia funciona; el email duplicado es rechazado y el email propio actual se permite (200).
---

#### Test TC008 put api auth password changes password with correct current password
- **Test Code:** [TC008_put_api_auth_password_changes_password_with_correct_current_password.py](./TC008_put_api_auth_password_changes_password_with_correct_current_password.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/ba51740f-1e39-43c5-bce3-157c75288395
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El cambio de contraseña con `passwordActual` correcta y contraseña nueva válida devuelve `200` con confirmación.
---

### Requirement: User administration CRUD
- **Description:** CRUD administrativo de usuarios (requiere token con rol `admin`).

#### Test TC009 get api usuarios with admin token returns paginated user list
- **Test Code:** [TC009_get_api_usuarios_with_admin_token_returns_paginated_user_list.py](./TC009_get_api_usuarios_with_admin_token_returns_paginated_user_list.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/1380ccab-1ff4-4545-8900-041429ac43fb
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** `GET /api/usuarios` con token de admin devuelve `200` con listado paginado (`total`, `pagina`, `limite`, `totalPaginas`, `usuarios`). Ejecutado con las credenciales del seed.
---

#### Test TC010 delete api usuarios id with admin token logically deletes user except self
- **Test Code:** [TC010_delete_api_usuarios_id_with_admin_token_logically_deletes_user_except_self.py](./TC010_delete_api_usuarios_id_with_admin_token_logically_deletes_user_except_self.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ee909ac8-2494-54db-b36c-c90b2c862112/test/dedbd5ec-4c98-48f9-8f23-ee899a3329b2
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** `DELETE /api/usuarios/:id` con token de admin realiza borrado lógico (`estado=false`) y protege contra el auto-borrado (`400`). Ejecutado con las credenciales del seed.
---

## 3️⃣ Coverage & Matching Metrics

- **100.00%** of tests passed

| Requirement             | Total Tests | ✅ Passed | ❌ Failed |
|-------------------------|-------------|-----------|-----------|
| Health check            | 1           | 1         | 0         |
| Authentication          | 7           | 7         | 0         |
| User administration CRUD| 2           | 2         | 0         |
---

## 4️⃣ Key Gaps / Risks
> 100% de las pruebas pasaron (10/10).
> Riesgo: el plan de TestSprite cubre un subconjunto de los casos de aceptación del PRD (health, auth, listado admin y borrado lógico); casos adicionales (filtros de rol/paginación, email duplicado, JSON malformado, control 401/403) están cubiertos por la suite Vitest de la API.
