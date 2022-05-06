import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';

const API_URL = process.env.UNLEASH_API || 'http://localhost:4242';

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        globals: true,
        setupFiles: 'src/setupTests.ts',
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, '**/cypress/**'],
    },
    server: {
        open: true,
        proxy: {
            '/api': {
                target: API_URL,
                changeOrigin: true,
            },
            '/auth': {
                target: API_URL,
                changeOrigin: true,
            },
            '/logout': {
                target: API_URL,
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'build',
    },
    plugins: [react(), tsconfigPaths(), svgr(), envCompatible()],
});
