/**
 * Shared helpers for eval task_003 Vitest configs.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vitest/config";
import { defineConfig } from "vitest/config";

export const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const requireFromFrontend = createRequire(path.join(frontendDir, "package.json"));

function resolveFromFrontend(specifier: string): string {
  // Vite alias replacements must use forward slashes on Windows.
  return requireFromFrontend.resolve(specifier).replace(/\\/g, "/");
}

/** Pin npm deps for eval tests outside apps/issueflow-frontend. */
export function evalPackageAliases(): Array<{ find: string | RegExp; replacement: string }> {
  return [
    { find: "@tanstack/react-query", replacement: resolveFromFrontend("@tanstack/react-query") },
    { find: "@testing-library/react", replacement: resolveFromFrontend("@testing-library/react") },
    {
      find: "@testing-library/user-event",
      replacement: resolveFromFrontend("@testing-library/user-event"),
    },
    { find: "react/jsx-dev-runtime", replacement: resolveFromFrontend("react/jsx-dev-runtime") },
    { find: "react-dom", replacement: resolveFromFrontend("react-dom") },
    { find: /^react$/, replacement: resolveFromFrontend("react") },
  ];
}

export function defineEvalTask003Config(testDir: string): UserConfig {
  const resolvedTestDir = path.resolve(frontendDir, testDir);

  return defineConfig({
    plugins: [react()],
    root: frontendDir,
    resolve: {
      alias: [
        ...evalPackageAliases(),
        { find: "@", replacement: path.join(frontendDir, "src") },
      ],
    },
    server: {
      fs: {
        allow: [frontendDir, resolvedTestDir],
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: [path.join(frontendDir, "src/test/setup.ts")],
      include: [`${testDir}/**/*.{test,spec}.{ts,tsx}`],
    },
  });
}
