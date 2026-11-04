import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
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
