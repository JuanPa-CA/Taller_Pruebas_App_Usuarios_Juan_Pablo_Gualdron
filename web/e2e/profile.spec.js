import { test, expect } from "@playwright/test";
import { loginViaUi, registerUser, uniqueEmail } from "./helpers.js";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Perfil del usuario", () => {
  test("el usuario cambia su contraseña, cierra sesión e inicia con la nueva", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("password");
    await registerUser(request, {
      nombre: "Password E2E",
      email,
      password: "Usuario123",
    });

    await loginViaUi(page, email, "Usuario123", /\/perfil$/);
    await expect(page.getByTestId("profile-role")).toHaveText("Usuario");

    await page.getByTestId("password-current").fill("Usuario123");
    await page.getByTestId("password-new").fill("Nueva1234");
    await page.getByTestId("password-confirmation").fill("Nueva1234");
    await page.getByTestId("password-submit").click();

    await expect(page.getByTestId("toast")).toContainText("Contraseña actualizada");

    await page.getByTestId("logout").click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill("Nueva1234");
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/perfil$/);
    await expect(page.getByTestId("current-user-name")).toContainText("Password E2E");
  });
});
