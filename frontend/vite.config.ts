import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';

const UNLEASH_API = process.env.UNLEASH_API || 'http://localhost:4242';
const UNLEASH_BASE_PATH = process.env.UNLEASH_BASE_PATH || '/';

if (!UNLEASH_BASE_PATH.startsWith('/') || !UNLEASH_BASE_PATH.endsWith('/')) {
    console.error('UNLEASH_BASE_PATH must both start and end with /');
    process.exit(1);
}

export default defineConfig({
    base: UNLEASH_BASE_PATH,
    build: {
        outDir: 'build',
        assetsDir: 'static',
    },
    test: {
        globals: true,
        setupFiles: 'src/setupTests.ts',
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, '**/cypress/**'],
    },
    server: {
        open: true,
        proxy: {
            [`${UNLEASH_BASE_PATH}api`]: {
                target: UNLEASH_API,
                changeOrigin: true,
            },
            [`${UNLEASH_BASE_PATH}auth`]: {
                target: UNLEASH_API,
                changeOrigin: true,
            },
            [`${UNLEASH_BASE_PATH}logout`]: {
                target: UNLEASH_API,
                changeOrigin: true,
            },
        },
    },
    plugins: [react(), tsconfigPaths(), svgr(), envCompatible()],
});
