import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so `dist/` can be served from any path, including file-less
  // static hosts that mount the build under a subdirectory.
  base: "./",
  plugins: [react()],
});
