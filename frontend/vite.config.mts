import { defineConfig, mergeConfig } from 'vite';
import {
    configDefaults,
    defineConfig as vitestDefineConfig,
} from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';
import babel from '@rolldown/plugin-babel';

const UNLEASH_API = process.env.UNLEASH_API || 'http://localhost:4242';
const UNLEASH_BASE_PATH = process.env.UNLEASH_BASE_PATH || '/';
const UNLEASH_FRONTEND_TOKEN = process.env.UNLEASH_FRONTEND_TOKEN || '';

if (!UNLEASH_BASE_PATH.startsWith('/') || !UNLEASH_BASE_PATH.endsWith('/')) {
    console.error('UNLEASH_BASE_PATH must both start and end with /');
    process.exit(1);
}

const vitestConfig = vitestDefineConfig({
    test: {
        globals: true,
        setupFiles: 'src/setupTests.ts',
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, '**/cypress/**'],
        server: {
            deps: {
                inline: ['chartjs-adapter-date-fns'],
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
});

const emotionBabelPlugin = [
    '@emotion',
    {
        autoLabel: 'always',
        labelFormat: '[filename]--[local]',
        importMap: {
            '@mui/material': {
                styled: {
                    canonicalImport: ['@emotion/styled', 'default'],
                    styledBaseImport: ['@mui/material', 'styled'],
                },
            },
        },
    },
] as const;

export default defineConfig(({ mode }) => {

    return mergeConfig(
        {
            base: UNLEASH_BASE_PATH,
            build: {
                outDir: 'build',
                assetsDir: 'static',
                assetsInlineLimit: 0,
                modulePreload: false,
                cssCodeSplit: false,
                ...(mode === 'development' ? { sourcemap: true } : {}),
            },
            resolve: {
                tsconfigPaths: true,
            },
            server: {
                open: true,
                host: true,
                port: 3000,
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
                    [`${UNLEASH_BASE_PATH}health`]: {
                        target: UNLEASH_API,
                        changeOrigin: true,
                    },
                    [`${UNLEASH_BASE_PATH}invite`]: {
                        target: UNLEASH_API,
                        changeOrigin: true,
                    },
                    [`${UNLEASH_BASE_PATH}edge`]: {
                        target: UNLEASH_API,
                        changeOrigin: true,
                    },
                },
                fs: {
                    allow: ['..'],
                },
            },
            plugins: [
                {
                    name: 'html-rewrite',
                    apply: 'serve',
                    transformIndexHtml(html) {
                        return html.replace(
                            /::unleashToken::/gi,
                            UNLEASH_FRONTEND_TOKEN,
                        );
                    },
                },
                react(),
                svgr(),
                envCompatible(),
                ...(mode === 'development' ? [
                    babel({
                        plugins: [emotionBabelPlugin],
                    })
                ] : []),
            ],
            optimizeDeps: {
                exclude: ['chartjs-adapter-date-fns'],
            },
        },
        vitestConfig,
    );
});
