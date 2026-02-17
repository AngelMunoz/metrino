import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["src/**/*.test.ts"],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: "es2022",
      loaders: {
        ".css": "empty",
      },
    }),
  ],
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: "chromium" }),
    playwrightLauncher({ product: "firefox" }),
  ],
  testFramework: {
    config: {
      ui: "tdd",
    },
  },
};
