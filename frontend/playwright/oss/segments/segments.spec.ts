import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { runBefore } from '../../support/helpers';

// Tests are ordered: create → duplicate-error → delete
test.describe.configure({ mode: 'serial' });

const randomId = String(Math.random()).split('.')[1];
const segmentName = `unleash-e2e-${randomId}`;

test.beforeEach(async ({ page }) => {
    await runBefore(page);
    await page.goto('/segments');
});

test('can create a segment', async ({ page }) => {
    await createSegmentUI(page, segmentName);
    await expect(page.getByRole('link', { name: segmentName })).toBeVisible();
});

test('gives an error if a segment exists with the same name', async ({
    page,
}) => {
    await page.getByTestId('NAVIGATE_TO_CREATE_SEGMENT').click();
    await page
        .getByTestId('SEGMENT_NAME_ID')
        .locator('input')
        .fill(segmentName);
    await expect(page.getByTestId('SEGMENT_NEXT_BTN_ID')).toBeDisabled();
    await expect(page.getByTestId('INPUT_ERROR_TEXT')).toContainText(
        'Segment name already exists',
    );
});

test('can delete a segment', async ({ page }) => {
    await expect(page.getByRole('link', { name: segmentName })).toBeVisible();
    await deleteSegmentUI(page, segmentName);
    await expect(
        page.getByRole('link', { name: segmentName }),
    ).not.toBeVisible();
});

async function createSegmentUI(page: Page, name: string): Promise<void> {
    await page.getByTestId('NAVIGATE_TO_CREATE_SEGMENT').click();

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/segments') &&
            resp.request().method() === 'POST',
    );

    await page.getByTestId('SEGMENT_NAME_ID').locator('input').fill(name);
    await page
        .getByTestId('SEGMENT_DESC_ID')
        .locator('input')
        .fill('hello-world');
    await page.getByTestId('SEGMENT_NEXT_BTN_ID').click();
    await page.getByTestId('SEGMENT_CREATE_BTN_ID').click();
    await responsePromise;
}

async function deleteSegmentUI(page: Page, name: string): Promise<void> {
    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/segments') &&
            resp.request().method() === 'DELETE',
    );
    await page.getByTestId(`SEGMENT_DELETE_BTN_ID_${name}`).click();
    await page
        .getByTestId('SEGMENT_DIALOG_NAME_ID')
        .locator('input')
        .fill(name);
    await page.getByTestId('DIALOGUE_CONFIRM_ID').click();
    await responsePromise;
}
