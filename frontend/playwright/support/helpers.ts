import type { Page } from '@playwright/test';

export const randomId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8);

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
        try {
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
        } catch {
            // Page/context closed before the route could be handled.
        }
    });

    await page.route('**/api/admin/user/splash/**', (route) =>
        route.fulfill({ status: 200 }),
    );
}
