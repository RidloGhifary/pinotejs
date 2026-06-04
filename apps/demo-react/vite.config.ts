import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-comment-library": fileURLToPath(
        new URL(
          "../../packages/react-comment-library/src/index.ts",
          import.meta.url,
        ),
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
