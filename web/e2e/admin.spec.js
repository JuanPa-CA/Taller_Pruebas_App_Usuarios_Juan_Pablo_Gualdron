import { test, expect } from "@playwright/test";
import {
  adminToken,
  createUserViaApi,
  deleteUserViaApi,
  findUserByEmail,
  uniqueEmail,
} from "./helpers.js";

test.describe("Administración de usuarios", () => {
  test("el admin ve la lista de usuarios del seed", async ({ page }) => {
    await page.goto("/usuarios");

    await expect(page.getByTestId("user-row").first()).toBeVisible();
    await expect(page.getByTestId("users-total")).toContainText("usuarios activos");
    await expect(page.getByTestId("users-table")).toBeVisible();
  });

  test("el admin crea un usuario, lo encuentra con el buscador y lo edita", async ({ page, request }) => {
    const email = uniqueEmail("creado");
    const nombre = `Creado E2E ${Date.now()}`;
    const token = await adminToken(request);

    try {
      await page.goto("/usuarios");
      await page.getByTestId("users-new").click();
      await expect(page).toHaveURL(/\/usuarios\/nuevo$/);

      await page.getByTestId("user-name").fill(nombre);
      await page.getByTestId("user-email").fill(email);
      await page.getByTestId("user-password").fill("Usuario123");
      await page.getByTestId("user-submit").click();

      await expect(page).toHaveURL(/\/usuarios$/);
      await expect(
        page.getByTestId("toast").filter({ hasText: "Usuario creado" }),
      ).toContainText("Usuario creado");

      await page.getByTestId("users-search").fill(email);
      const row = page.getByTestId("user-row").filter({ hasText: email });
      await expect(row).toHaveCount(1);

      await row.getByTestId("user-edit").click();
      await expect(page.getByTestId("user-name")).toHaveValue(nombre);

      const nombreEditado = `${nombre} Editado`;
      await page.getByTestId("user-name").fill(nombreEditado);
      await page.getByTestId("user-submit").click();

      await expect(page).toHaveURL(/\/usuarios$/);
      await expect(
        page.getByTestId("toast").filter({ hasText: "Usuario actualizado" }),
      ).toContainText("Usuario actualizado");

      await page.getByTestId("users-search").fill("Editado");
      await expect(
        page.getByTestId("user-row").filter({ hasText: nombreEditado }),
      ).toHaveCount(1);
    } finally {
      const creado = await findUserByEmail(request, token, email);
      if (creado) await deleteUserViaApi(request, token, creado.uid);
    }
  });

  test("el admin elimina un usuario con el diálogo de confirmación y ese usuario ya no puede iniciar sesión", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("borrar");
    const token = await adminToken(request);

    await createUserViaApi(request, token, {
      nombre: "Borrar E2E",
      email,
      password: "Usuario123",
      rol: "usuario",
    });

    await page.goto("/usuarios");
    await page.getByTestId("users-search").fill(email);
    const row = page.getByTestId("user-row").filter({ hasText: email });
    await expect(row).toHaveCount(1);

    await row.getByTestId("user-delete").click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-accept").click();

    await expect(page.getByTestId("toast").filter({ hasText: "eliminado" })).toBeVisible();
    await expect(page.getByTestId("user-row").filter({ hasText: email })).toHaveCount(0);

    await page.getByTestId("logout").click();
    // El logout puede aterrizar en /login?redirect=... si un 401 en vuelo dispara el
    // manejador de sesión; basta con esperar el formulario de login.
    await expect(page.getByTestId("login-form")).toBeVisible();

    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill("Usuario123");
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("alert")).toContainText(/Credenciales inválidas|Usuario desactivado/);
  });

  test("el filtro por rol y la paginación actualizan el listado", async ({ page, request }) => {
    const token = await adminToken(request);
    const creados = [];

    try {
      for (let i = 0; i < 8; i += 1) {
        creados.push(
          await createUserViaApi(request, token, {
            nombre: `Pagina E2E ${i}`,
            email: uniqueEmail(`pagina${i}`),
            password: "Usuario123",
            rol: "usuario",
          }),
        );
      }

      await page.goto("/usuarios");
      await expect(page.getByTestId("pagination-info")).toBeVisible();
      const infoPagina1 = await page.getByTestId("pagination-info").textContent();

      await expect(page.getByTestId("pagination-next")).toBeEnabled();
      await page.getByTestId("pagination-next").click();

      await expect(page.getByTestId("pagination-page")).toContainText("Página 2");
      await expect(page.getByTestId("pagination-info")).not.toHaveText(infoPagina1 ?? "");

      await page.getByTestId("users-role-filter").selectOption("admin");
      await expect
        .poll(async () => {
          const filas = page.getByTestId("user-row");
          const total = await filas.count();
          if (total === 0) return false;
          for (let i = 0; i < total; i += 1) {
            const texto = await filas.nth(i).textContent();
            if (!texto.includes("Administrador")) return false;
          }
          return true;
        })
        .toBe(true);

      await page.getByTestId("users-role-filter").selectOption("usuario");
      await expect
        .poll(async () => {
          const filas = page.getByTestId("user-row");
          const total = await filas.count();
          if (total === 0) return false;
          for (let i = 0; i < total; i += 1) {
            const texto = await filas.nth(i).textContent();
            if (!texto.includes("Usuario")) return false;
          }
          return true;
        })
        .toBe(true);
    } finally {
      for (const usuario of creados) {
        await deleteUserViaApi(request, token, usuario.uid);
      }
    }
  });
});
