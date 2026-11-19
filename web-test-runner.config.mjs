import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

/**
 * `src/utils/animations.ts` reads its keyframes from `styles/animations.css?inline`, a
 * query suffix that only Vite implements. The esbuild loader below already turns a plain
 * `.css` import into an empty module; this turns the suffixed form into one too, so the
 * suite can load the module. The stylesheet itself is checked where it really loads, in
 * `e2e/animations-source.spec.ts`.
 */
const INLINE_CSS_MODULE = "/inline-css-stub.js";

const inlineCssPlugin = {
  name: "inline-css-as-empty-module",
  resolveImport({ source }) {
    if (/\.css\?inline$/.test(source)) return INLINE_CSS_MODULE;
  },
  transformImport({ source }) {
    if (/\.css\?inline$/.test(source)) return INLINE_CSS_MODULE;
  },
  serve(context) {
    if (context.path !== INLINE_CSS_MODULE) return;
    return { body: "export default '';", type: "text/javascript" };
  },
};

export default {
  files: ["src/**/*.test.ts"],
  plugins: [
    inlineCssPlugin,
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
