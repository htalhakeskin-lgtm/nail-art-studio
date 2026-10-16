import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Unit + integration tests (14-test). Turkish locale and Istanbul time zone, like production users.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "server-only" throws outside React Server Components; tests import server modules directly.
      "server-only": fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    environment: "node",
    env: { TZ: "Europe/Istanbul", LANG: "tr_TR.UTF-8" },
    restoreMocks: true,
  },
});
