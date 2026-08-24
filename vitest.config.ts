import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The `@/*` path alias is declared in tsconfig.json, which Vitest does not
// read. Mirrored here by hand rather than pulling in vite-tsconfig-paths — one
// line beats a dependency.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
