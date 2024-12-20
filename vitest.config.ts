import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        exclude: ['**/node_modules/**', 'public/**'],
        setupFiles: ['./test/setup.ts'],
        globalSetup: ['./test/globalSetup.ts'],
        globals: true,
        reporters: ['verbose'],
        testTimeout: 5000,
        pool: 'threads',
        sequence: {
            shuffle: true,
        },
    },
})