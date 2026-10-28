import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as setup, expect } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(__dirname, ".auth");
const adminState = path.join(authDir, "admin.json");
const origin = "http://localhost:5173";

async function login(request, email, password) {
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).token;
}

setup("guarda la sesión del administrador para reutilizarla", async ({ request }) => {
  const token = await login(request, "admin@demo.com", "Admin123!");

  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(
    adminState,
    JSON.stringify(
      {
        cookies: [],
        origins: [
          {
            origin,
            localStorage: [{ name: "x-token", value: token }],
          },
        ],
      },
      null,
      2,
    ),
  );
});
