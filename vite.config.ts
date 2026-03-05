import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "demo") {
    return {
      root: "demo",
      publicDir: "../public",
      resolve: {
        alias: {
          "@src": resolve(__dirname, "src"),
        },
      },
      server: {
        port: 5173,
        open: true,
      },
      build: {
        outDir: "../dist-demo",
        emptyOutDir: true,
      },
    };
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "Metrino",
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: ["lit", "lit/decorators.js", "lit/directives/*.js", "@mdi/js"],
        output: [
          {
            format: "es",
            preserveModules: true,
            preserveModulesRoot: "src",
            entryFileNames: "[name].js",
          },
        ],
      },
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
    },
  };
});
