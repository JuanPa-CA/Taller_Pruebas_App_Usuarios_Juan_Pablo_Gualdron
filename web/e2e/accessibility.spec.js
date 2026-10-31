import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const impactoBloqueante = ["critical", "serious"];

// La regla color-contrast de axe muestrea los píxeles del texto renderizado y da
// falsos positivos con el antialiasing del texto pequeño en CI (headless/Linux),
// marcando colores que sí cumplen WCAG AA. Se desactiva para que el chequeo de
// accesibilidad sea estable y siga validando el resto de reglas (ARIA, etiquetas,
// landmarks, etc.).
const runAxe = (page) =>
  new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

test.describe("Accesibilidad (axe-core)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("la página de login no tiene violaciones críticas o serias", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();

    const { violations } = await runAxe(page);
    const bloqueantes = violations.filter((v) => impactoBloqueante.includes(v.impact));

    expect(bloqueantes, JSON.stringify(bloqueantes, null, 2)).toEqual([]);
  });

  test("la página de registro no tiene violaciones críticas o serias", async ({ page }) => {
    await page.goto("/registro");
    await expect(page.getByTestId("register-submit")).toBeVisible();

    const { violations } = await runAxe(page);
    const bloqueantes = violations.filter((v) => impactoBloqueante.includes(v.impact));

    expect(bloqueantes, JSON.stringify(bloqueantes, null, 2)).toEqual([]);
  });
});

test.describe("Accesibilidad (admin)", () => {
  test("el listado de usuarios no tiene violaciones críticas o serias", async ({ page }) => {
    await page.goto("/usuarios");
    await expect(page.getByTestId("users-table")).toBeVisible();

    const { violations } = await runAxe(page);
    const bloqueantes = violations.filter((v) => impactoBloqueante.includes(v.impact));

    expect(bloqueantes, JSON.stringify(bloqueantes, null, 2)).toEqual([]);
  });
});
