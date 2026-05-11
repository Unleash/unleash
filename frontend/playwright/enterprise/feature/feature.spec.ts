import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
    createProjectAPI,
    deleteFeatureAPI,
    deleteProjectAPI,
} from '../../support/api';
import { runBefore } from '../../support/helpers';
import { AUTH_FILE } from '../../support/constants';

// Tests are ordered: create → duplicate-error → (skipped) strategy
test.describe.configure({ mode: 'serial' });

const randomId = String(Math.random()).split('.')[1];
const featureToggleName = `unleash-e2e-${randomId}`;
const projectName = `unleash-e2e-project-${randomId}`;

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        await createProjectAPI(context.request, projectName);
    } finally {
        await context.close();
    }
});

test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        await deleteFeatureAPI(context.request, featureToggleName, projectName);
        await deleteProjectAPI(context.request, projectName);
    } finally {
        await context.close();
    }
});

test.beforeEach(async ({ page }) => {
    await runBefore(page);
    await page.goto('/features');
});

test('can create a feature flag', async ({ page }) => {
    await createFeatureUI(page, featureToggleName, projectName);
    await expect(
        page.locator('td').filter({ hasText: featureToggleName }),
    ).toBeVisible();
});

test('gives an error if a toggle exists with the same name', async ({
    page,
}) => {
    await createFeatureUI(page, featureToggleName, projectName, {
        awaitResponse: false,
    });
    await expect(page.getByTestId('INPUT_ERROR_TEXT')).toContainText(
        'A flag with that name already exists',
    );
});

test.skip('can add, update and delete a gradual rollout strategy to the development environment', async () => {
    // TODO: migrate addFlexibleRolloutStrategyToFeatureUI / updateFlexibleRolloutStrategyUI
});

async function createFeatureUI(
    page: Page,
    name: string,
    project: string,
    { awaitResponse = true }: { awaitResponse?: boolean } = {},
): Promise<void> {
    await page.goto(`/projects/${project}`);
    await page.getByTestId('NAVIGATE_TO_CREATE_FEATURE').first().click();

    const responsePromise = awaitResponse
        ? page.waitForResponse(
              (resp) =>
                  resp
                      .url()
                      .includes(`/api/admin/projects/${project}/features`) &&
                  resp.request().method() === 'POST',
          )
        : null;

    await page.getByTestId('FORM_NAME_INPUT').locator('input').fill(name);
    await page
        .getByTestId('FORM_DESCRIPTION_INPUT')
        .locator('textarea')
        .first()
        .fill('hello-world');
    await page.getByTestId('FORM_CREATE_BUTTON').first().click();
    if (responsePromise) await responsePromise;
}
