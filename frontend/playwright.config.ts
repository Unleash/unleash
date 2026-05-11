import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4242';
const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
    testDir: './playwright',
    timeout: 30_000,
    expect: { timeout: 12_000 },
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: [['html', { open: 'never' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'oss',
            use: {
                ...devices['Desktop Chrome'],
                storageState: AUTH_FILE,
            },
            dependencies: ['setup'],
            testMatch: 'oss/**/*.spec.ts',
        },
        // Enterprise frontend runs on port 3000 (started separately via `pnpm dev` in frontend/).
        // The enterprise backend must be started from the enterprise repository.
        {
            name: 'enterprise',
            use: {
                ...devices['Desktop Chrome'],
                storageState: AUTH_FILE,
                baseURL: process.env.BASE_URL || 'http://localhost:3000',
            },
            dependencies: ['setup'],
            testMatch: ['{oss,enterprise}/**/*.spec.ts'],
        },
    ],
});
