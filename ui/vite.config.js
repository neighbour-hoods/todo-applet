import { defineConfig } from "vite";

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    globals: true,
    deps: {
        inline: [/@neighbourhoods/, /@scoped-elements\/shoelace/]
      }
  },
  plugins: [
    // checker({
    //   typescript: true,
    //   eslint: {
    //     lintCommand: "eslint --ext .ts,.html src",
    //   },
    // }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: "node_modules/@shoelace-style/shoelace/dist/assets",
    //       dest: "shoelace",
    //     }
    //   ],
    // }),
  ],
  build: { 
    sourcemap: true,
  }
});
