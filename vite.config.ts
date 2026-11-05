import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// `pnpm preview` serves the contact sheet in preview/. It is never part of the package.
export default defineConfig({
  root: "preview",
  plugins: [react()],
  server: { port: 5199 },
  test: {
    root: ".",
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
