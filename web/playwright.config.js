import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "../api");
const adminState = path.resolve(__dirname, "e2e/.auth/admin.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:5173",
    testIdAttribute: "data-test",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.js/,
    },
    {
      name: "chromium",
      testIgnore: /.*\.setup\.js/,
      use: { ...devices["Desktop Chrome"], storageState: adminState },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      testIgnore: /.*\.setup\.js/,
      use: { ...devices["Desktop Firefox"], storageState: adminState },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "npm run seed && npm start",
      cwd: apiDir,
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        MONGODB_CNX: "mongodb://127.0.0.1:27017/app-usuarios-e2e",
      },
    },
    {
      command: "npm run dev",
      cwd: __dirname,
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
