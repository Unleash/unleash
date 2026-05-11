import { expect, test } from '@playwright/test';
import { deleteFeatureAPI } from '../../support/api';
import { runBefore } from '../../support/helpers';
import { AUTH_FILE } from '../../support/constants';
import type { Page } from '@playwright/test';

const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `unleash-e2e-${randomId}`;

test.beforeEach(async ({ page }) => {
    await runBefore(page);
});

test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        await deleteFeatureAPI(context.request, featureToggleName);
    } finally {
        await context.close();
    }
});

test('can create a feature flag', async ({ page }) => {
    await createFeatureUI(page, featureToggleName);
    await expect(page.getByText(featureToggleName)).toBeVisible();
});

async function createFeatureUI(
    page: Page,
    name: string,
    project = 'default',
): Promise<void> {
    await page.goto(`/projects/${project}`);
    await page.getByTestId('NAVIGATE_TO_CREATE_FEATURE').first().click();

    const createResponse = page.waitForResponse(
        (resp) =>
            resp.url().includes(`/api/admin/projects/${project}/features`) &&
            resp.request().method() === 'POST',
    );

    await page.getByTestId('FORM_NAME_INPUT').locator('input').fill(name);
    await page
        .getByTestId('FORM_DESCRIPTION_INPUT')
        .locator('textarea')
        .first()
        .fill('hello-world');
    await page.getByTestId('FORM_CREATE_BUTTON').first().click();

    await createResponse;
}
