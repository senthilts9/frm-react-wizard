import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // Dev-only: lets the local-only Mock Answers view read the private,
  // gitignored study data repo that lives outside this project. Has no
  // effect on `vite build` -- nothing outside src/public gets bundled into
  // dist/, so this can never leak into the GitHub Pages deploy.
  server: {
    fs: {
      allow: [".", "../frm-mock-answers-private"],
    },
  },
});
