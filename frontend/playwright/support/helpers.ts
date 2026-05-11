import type { Page } from '@playwright/test';

const AUTH_USER = process.env.AUTH_USER || 'admin';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'unleash4all';

/**
 * Log in via the UI. Prefer storageState (set in playwright.config.ts) for
 * most tests — this function is useful when a test needs to log in explicitly
 * (e.g. as a different user, or to exercise the login flow itself).
 */
export async function loginUI(
    page: Page,
    user = AUTH_USER,
    password = AUTH_PASSWORD,
): Promise<void> {
    await page.goto('/');
    await page.getByTestId('LOGIN_EMAIL_ID').locator('input').fill(user);
    await page.getByTestId('LOGIN_PASSWORD_ID').locator('input').fill(password);
    await page.getByTestId('LOGIN_BUTTON').click();
    await page.getByTestId('HEADER_USER_AVATAR').waitFor();
}

/**
 * Suppress UI noise that would otherwise interfere with tests:
 * - sets localStorage to hide the "production guard" modal
 * - stubs the user API to mark splash screens as already seen
 *
 * Must be called before the first page.goto() in each test so that
 * addInitScript and route intercepts are registered in time.
 */
export async function runBefore(page: Page): Promise<void> {
    await page.addInitScript(() => {
        localStorage.setItem(
            'useFeatureStrategyProdGuardSettings:v2',
            JSON.stringify({ hide: true }),
        );
    });

    await page.route('**/api/admin/user', async (route) => {
        const response = await route.fetch();
        try {
            const json = await response.json();
            json.splash = {
                ...json.splash,
                personalDashboardKeyConcepts: true,
                'strategy-drag-tooltip': true,
            };
            await route.fulfill({ response, json });
        } catch {
            await route.fulfill({ response });
        }
    });

    await page.route('**/api/admin/user/splash/**', (route) =>
        route.fulfill({ status: 200 }),
    );
}
