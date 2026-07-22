import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { stringToSlug } from "./src/utils/stringToSlug";

// https://vitejs.dev/config/
// Local / iGEM default: /syphu-china/
// GitHub Pages: set VITE_BASE_PATH=/syphu-china-2026/ in CI
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());

  const defaultBase = `/${stringToSlug(env.VITE_TEAM_NAME)}/`;
  const base = process.env.VITE_BASE_PATH || defaultBase;

  return defineConfig({
    base,
    plugins: [react()],
  });
};
