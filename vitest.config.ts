import { defineConfig } from 'vitest/config'

 export default defineConfig({
     test: {
         environment: 'jsdom',
         exclude: ['**/node_modules/**', 'public/**'],
         setupFiles: ['./vitest.setup.ts'],
         globals: true,
     },
 })