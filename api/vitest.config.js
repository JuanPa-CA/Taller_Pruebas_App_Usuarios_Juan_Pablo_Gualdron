import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "secreto-de-prueba-vitest-1234567890",
      JWT_EXPIRA: "1h",
    },
    hookTimeout: 60000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "app.js",
        "controllers/**",
        "middlewares/**",
        "helpers/**",
        "models/**",
        "routes/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
