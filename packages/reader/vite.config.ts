import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "plif-book": resolve(__dirname, "src/web-component.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@plif/core", "page-flip"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@plif/core": "PlifCore",
          "page-flip": "StPageFlip",
        },
      },
    },
  },
});
