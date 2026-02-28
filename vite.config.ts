import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin({
      // Store CSS in a global variable so index.ts can inject it into the
      // Shadow DOM root, preventing any style leakage in/out of the devtools.
      injectCodeFunction: (cssCode: string) => {
        (globalThis as Record<string, unknown>)["__MSW_DEVTOOLS_CSS__"] =
          cssCode;
      },
    }),
    dts({
      insertTypesEntry: true,
      staticImport: true,
      tsconfigPath: "./tsconfig.app.json",
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["src/main.ts"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MswDevtoolsPlugin",
      fileName: "msw-devtools",
    },
    rollupOptions: {
      external: ["vue", "msw"],
      output: {
        globals: {
          vue: "Vue",
          msw: "MSW",
        },
      },
    },
  },
});
