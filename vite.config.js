import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3847,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 3847,
    strictPort: true,
  },
});
