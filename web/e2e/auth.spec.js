import { test, expect } from "@playwright/test";
import { loginViaUi, registerUser, uniqueEmail } from "./helpers.js";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Autenticación y navegación", () => {
  test("login con credenciales incorrectas muestra el alert y permanece en /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("admin@demo.com");
    await page.getByTestId("login-password").fill("Incorrecta123!");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("alert")).toContainText("Credenciales inválidas");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("el registro de una cuenta nueva entra a /perfil y muestra el rol Usuario", async ({ page }) => {
    const email = uniqueEmail("registro");

    await page.goto("/registro");
    await page.getByTestId("register-name").fill("Registro E2E");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill("Usuario123");
    await page.getByTestId("register-confirmation").fill("Usuario123");
    await page.getByTestId("register-submit").click();

    await expect(page).toHaveURL(/\/perfil$/);
    await expect(page.getByTestId("profile-role")).toHaveText("Usuario");
    await expect(page.getByTestId("current-user-name")).toContainText("Registro E2E");
  });

  test("sin sesión, /usuarios redirige a /login", async ({ page }) => {
    await page.goto("/usuarios");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("un usuario con rol usuario que abre /usuarios es redirigido a /perfil", async ({ page, request }) => {
    const email = uniqueEmail("guardia");
    await registerUser(request, {
      nombre: "Guardia E2E",
      email,
      password: "Usuario123",
    });

    await loginViaUi(page, email, "Usuario123", /\/perfil$/);
    await page.goto("/usuarios");

    await expect(page).toHaveURL(/\/perfil$/);
    await expect(page.getByTestId("profile-role")).toHaveText("Usuario");
  });

  test("una ruta que no existe muestra la página de no encontrada", async ({ page }) => {
    await page.goto("/ruta-que-no-existe");

    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
    await expect(page.getByTestId("go-home")).toBeVisible();
  });
});
