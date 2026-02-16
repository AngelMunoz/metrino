import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["src/**/*.test.ts"],
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: "chromium" }),
    playwrightLauncher({ product: "firefox" }),
    playwrightLauncher({ product: "webkit" }),
  ],
  testFramework: {
    config: {
      ui: "tdd",
    },
  },
};
