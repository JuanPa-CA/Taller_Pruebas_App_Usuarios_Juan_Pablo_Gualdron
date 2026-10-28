
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** app-usuarios
- **Date:** 2026-10-26
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### Requirement: Route guarding and 404
- **Description:** Protección de rutas por sesión/rol y página 404 para rutas inexistentes.

#### Test TC001 Guest is redirected away from protected routes
- **Test Code:** [TC001_Guest_is_redirected_away_from_protected_routes.py](./TC001_Guest_is_redirected_away_from_protected_routes.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/7a986088-8ce5-4501-a381-3d7ac3b1f290
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Un invitado que intenta abrir `/perfil` o `/usuarios` es redirigido al login.
---

#### Test TC003 Guest cannot access the users list
- **Test Code:** [TC003_Guest_cannot_access_the_users_list.py](./TC003_Guest_cannot_access_the_users_list.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/941e6815-ca7e-4624-bb9f-4105b08b0bd0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Un invitado no puede acceder al listado de usuarios y es enviado a login.
---

#### Test TC006 Regular user is redirected away from the admin users list
- **Test Code:** [TC006_Regular_user_is_redirected_away_from_the_admin_users_list.py](./TC006_Regular_user_is_redirected_away_from_the_admin_users_list.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/8f82db36-35e6-4fd8-b723-6554e3b3a448
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Un usuario con rol `usuario` es redirigido a `/perfil` al intentar acceder al listado de administración.
---

#### Test TC009 Unknown routes show the not found page
- **Test Code:** [TC009_Unknown_routes_show_the_not_found_page.py](./TC009_Unknown_routes_show_the_not_found_page.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/2e422f93-b6ad-4677-83de-9751c817486a
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Una ruta inexistente muestra la página "Página no encontrada".
---

### Requirement: User Login
- **Description:** Inicio de sesión y redirección según el rol.

#### Test TC005 User logs in and reaches the role-based area
- **Test Code:** [TC005_User_logs_in_and_reaches_the_role_based_area.py](./TC005_User_logs_in_and_reaches_the_role_based_area.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/b144504f-75a0-4641-b00a-7c729fe2ac4b
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El login con credenciales válidas redirige al área correspondiente según el rol.
---

### Requirement: User Registration
- **Description:** Registro público con validación de contraseña y entrada automática al perfil.

#### Test TC004 Guest signs up and lands in own profile
- **Test Code:** [TC004_Guest_signs_up_and_lands_in_own_profile.py](./TC004_Guest_signs_up_and_lands_in_own_profile.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/edc7d315-07f3-4de9-b30b-f1ba45d0dc1e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El registro con datos válidos inicia sesión automáticamente y muestra el perfil con rol `Usuario`.
---

### Requirement: Profile management
- **Description:** Ver/editar perfil, cambiar contraseña y cerrar sesión.

#### Test TC007 Authenticated user logs out
- **Test Code:** [TC007_Authenticated_user_logs_out.py](./TC007_Authenticated_user_logs_out.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/2e7f05d9-39f1-44e0-8f1a-7276c5861f5b
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El usuario autenticado puede cerrar sesión y vuelve a la página de login.
---

#### Test TC011 Authenticated user updates profile details
- **Test Code:** [TC011_Authenticated_user_updates_profile_details.py](./TC011_Authenticated_user_updates_profile_details.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/a32c43df-e2ce-41eb-860b-32a2d5dadc0e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El usuario puede actualizar nombre y email y ver los cambios reflejados en el perfil.
---

#### Test TC014 Authenticated user changes password successfully
- **Test Code:** [TC014_Authenticated_user_changes_password_successfully.py](./TC014_Authenticated_user_changes_password_successfully.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/d1c00d72-1561-4cb5-b529-4543fcab39e9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El cambio de contraseña con la contraseña actual correcta muestra confirmación.
---

### Requirement: User administration CRUD
- **Description:** Listado, búsqueda, filtro por rol, paginación y navegación del área de administración.

#### Test TC002 Admin views the user list from the initial route
- **Test Code:** [TC002_Admin_views_the_user_list_from_the_initial_route.py](./TC002_Admin_views_the_user_list_from_the_initial_route.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/5ba18230-860c-4dab-92fc-fb15fbd8bb80
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El admin entra y llega al listado de usuarios con la tabla visible.
---

#### Test TC008 Admin can view and browse the users list
- **Test Code:** [TC008_Admin_can_view_and_browse_the_users_list.py](./TC008_Admin_can_view_and_browse_the_users_list.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/1962ddb8-42af-47ca-8ed1-c088d2a5d4aa
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El admin navega la lista paginada y cambia de página correctamente.
---

#### Test TC010 Admin searches users by name or email
- **Test Code:** [TC010_Admin_searches_users_by_name_or_email.py](./TC010_Admin_searches_users_by_name_or_email.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/b29f8161-ebcb-413b-b841-158c6d85abfc
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** La búsqueda por nombre/email filtra el listado y muestra resultados coincidentes.
---

#### Test TC012 Admin can search users by name or email
- **Test Code:** [TC012_Admin_can_search_users_by_name_or_email.py](./TC012_Admin_can_search_users_by_name_or_email.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/ad6921bd-7e05-40c8-bc36-f9087d4b1616
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** La búsqueda restringe el listado a los resultados coincidentes.
---

#### Test TC013 Admin filters users by role
- **Test Code:** [TC013_Admin_filters_users_by_role.py](./TC013_Admin_filters_users_by_role.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/db85858d-ae8b-4c93-bedc-28a5b397fd0c
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El filtro por rol actualiza el listado a los usuarios del rol seleccionado.
---

#### Test TC015 Admin can filter users by role
- **Test Code:** [TC015_Admin_can_filter_users_by_role.py](./TC015_Admin_can_filter_users_by_role.py)
- **Test Error:** 
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/454af730-0c95-5279-97fe-1816ee835969/test/29509360-1cb7-42f8-8ec5-1906ed4c1601
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** El filtro por rol muestra únicamente los usuarios del rol seleccionado.
---

## 3️⃣ Coverage & Matching Metrics

- **100.00%** of tests passed

| Requirement               | Total Tests | ✅ Passed | ❌ Failed |
|---------------------------|-------------|-----------|-----------|
| Route guarding and 404    | 4           | 4         | 0         |
| User Login                | 1           | 1         | 0         |
| User Registration         | 1           | 1         | 0         |
| Profile management        | 3           | 3         | 0         |
| User administration CRUD  | 6           | 6         | 0         |
---

## 4️⃣ Key Gaps / Risks
> 100% de las pruebas pasaron (15/15).
> Nota: en modo de servidor de desarrollo TestSprite limitó la ejecución a 15 casos de alta prioridad (de los 25 del plan). Los casos restantes (crear/editar/eliminar usuario, cancelar borrado, validación de contraseña débil, confirmación no coincidente) quedan cubiertos por la suite Vitest de la web.
