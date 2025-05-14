import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ['./src/test-setup.ts'],
        setupFiles: ['./src/test/errorWithMessage.ts'],
        testTimeout: 30000,
        exclude: [...configDefaults.exclude, 'website/**', 'frontend/**'],
        environment: 'node',
        coverage: {
            reporter: 'json',
            provider: 'v8',
        },
    },
});
