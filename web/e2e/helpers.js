import { expect } from "@playwright/test";

let counter = 0;

export function uniqueEmail(prefix) {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@demo.com`;
}

export async function adminToken(request) {
  const response = await request.post("/api/auth/login", {
    data: { email: "admin@demo.com", password: "Admin123!" },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).token;
}

export async function registerUser(request, data) {
  const response = await request.post("/api/auth/registro", { data });
  expect(response.status()).toBe(201);
  return response.json();
}

export async function createUserViaApi(request, token, data) {
  const response = await request.post("/api/usuarios", {
    data,
    headers: { "x-token": token },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

export async function deleteUserViaApi(request, token, uid) {
  const response = await request.delete(`/api/usuarios/${uid}`, {
    headers: { "x-token": token },
  });
  expect(response.ok()).toBeTruthy();
}

export async function findUserByEmail(request, token, email) {
  const response = await request.get("/api/usuarios", {
    params: { buscar: email },
    headers: { "x-token": token },
  });
  expect(response.ok()).toBeTruthy();
  const { usuarios } = await response.json();
  return usuarios.find((usuario) => usuario.email === email) ?? null;
}

export async function loginViaUi(page, email, password, expectedUrl) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(expectedUrl);
}
