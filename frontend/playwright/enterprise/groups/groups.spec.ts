import { expect, test } from '@playwright/test';
import { createUserAPI, deleteUserAPI } from '../../support/api';
import { runBefore } from '../../support/helpers';
import { AUTH_FILE } from '../../support/constants';

// Tests are ordered: create → duplicate-error → edit → add-user → remove-user → delete
test.describe.configure({ mode: 'serial' });

const randomId = String(Math.random()).split('.')[1];
const groupName = `unleash-e2e-${randomId}`;

const userIds: number[] = [];

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        for (let i = 1; i <= 2; i++) {
            const id = await createUserAPI(
                context.request,
                `unleash-e2e-user${i}-${randomId}`,
                `unleash-e2e-user${i}-${randomId}@test.com`,
            );
            userIds.push(id);
        }
    } finally {
        await context.close();
    }
});

test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        for (const id of userIds) {
            await deleteUserAPI(context.request, id);
        }
    } finally {
        await context.close();
    }
});

test.beforeEach(async ({ page }) => {
    await runBefore(page);
    await page.goto('/admin/groups');
});

test('can create a group', async ({ page }) => {
    await page.getByTestId('NAVIGATE_TO_CREATE_GROUP').click();

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/groups') &&
            resp.request().method() === 'POST',
    );

    await page.getByTestId('UG_NAME_ID').locator('input').fill(groupName);
    await page
        .getByTestId('UG_DESC_ID')
        .locator('textarea')
        .first()
        .fill('hello-world');
    await page.getByTestId('UG_USERS_ID').click();
    await page
        .getByText(`unleash-e2e-user1-${randomId}`, { exact: true })
        .click();

    await page.getByTestId('UG_CREATE_BTN_ID').click();
    await responsePromise;
    await expect(page.getByText(groupName, { exact: true })).toBeVisible();
});

test('gives an error if a group exists with the same name', async ({
    page,
}) => {
    await page.getByTestId('NAVIGATE_TO_CREATE_GROUP').click();
    await page.getByTestId('UG_NAME_ID').locator('input').fill(groupName);
    await expect(page.getByTestId('INPUT_ERROR_TEXT')).toContainText(
        'A group with that name already exists.',
    );
});

test('can edit a group', async ({ page }) => {
    await page.getByText(groupName, { exact: true }).click();
    await page.getByTestId('UG_EDIT_BTN_ID').click();

    await page
        .getByTestId('UG_DESC_ID')
        .locator('textarea')
        .first()
        .fill('hello-world-my edited description');

    await page.getByTestId('UG_SAVE_BTN_ID').click();
    await expect(
        page.getByText('hello-world-my edited description'),
    ).toBeVisible();
});

test('can add user to a group', async ({ page }) => {
    await page.getByText(groupName, { exact: true }).click();
    await page.getByTestId('UG_EDIT_USERS_BTN_ID').click();
    await page.getByTestId('UG_USERS_ID').click();
    await page
        .getByText(`unleash-e2e-user2-${randomId}`, { exact: true })
        .click();

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/groups') &&
            resp.request().method() === 'PUT',
    );
    await page.getByTestId('UG_SAVE_BTN_ID').click();
    await responsePromise;

    await expect(
        page.getByTestId(`UG_REMOVE_USER_BTN_ID-${userIds[0]}`),
    ).toBeVisible();
    await expect(
        page.getByTestId(`UG_REMOVE_USER_BTN_ID-${userIds[1]}`),
    ).toBeVisible();
});

test('can remove user from a group', async ({ page }) => {
    await page.getByText(groupName, { exact: true }).click();

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/groups') &&
            resp.request().method() === 'PUT',
    );
    await page.getByTestId(`UG_REMOVE_USER_BTN_ID-${userIds[1]}`).click();
    await page.getByTestId('DIALOGUE_CONFIRM_ID').click();
    await responsePromise;

    await expect(
        page.getByTestId(`UG_REMOVE_USER_BTN_ID-${userIds[0]}`),
    ).toBeVisible();
    await expect(
        page.getByTestId(`UG_REMOVE_USER_BTN_ID-${userIds[1]}`),
    ).not.toBeAttached();
});

test('can delete a group', async ({ page }) => {
    await page.getByText(groupName, { exact: true }).click();

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp.url().includes('/api/admin/groups/') &&
            resp.request().method() === 'DELETE',
    );
    await page.getByTestId('UG_DELETE_BTN_ID').click();
    await page.getByTestId('DIALOGUE_CONFIRM_ID').click();
    await responsePromise;

    await expect(page.getByText(groupName, { exact: true })).not.toBeAttached();
});
