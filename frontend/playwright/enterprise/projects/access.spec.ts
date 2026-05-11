import { expect, test } from '@playwright/test';
import {
    createGroupAPI,
    createProjectAPI,
    createUserAPI,
    deleteGroupAPI,
    deleteProjectAPI,
    deleteUserAPI,
} from '../../support/api';
import { runBefore } from '../../support/helpers';
import { AUTH_FILE } from '../../support/constants';

// Tests are ordered: assign-user → assign-group → edit-role → multi-role → remove
test.describe.configure({ mode: 'serial' });

const randomId = String(Math.random()).split('.')[1];
const groupAndProjectName = `group-e2e-${randomId}`;
const userName = `user-e2e-${randomId}`;

const userIds: number[] = [];
const groupIds: number[] = [];

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    try {
        for (let i = 1; i <= 2; i++) {
            const name = `${i}-${userName}`;
            const userId = await createUserAPI(
                context.request,
                name,
                `${name}@test.com`,
            );
            userIds.push(userId);
            const groupId = await createGroupAPI(
                context.request,
                `${i}-${groupAndProjectName}`,
                [userId],
            );
            groupIds.push(groupId);
        }
        await createProjectAPI(context.request, groupAndProjectName);
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
        for (const id of groupIds) {
            await deleteGroupAPI(context.request, id);
        }
        await deleteProjectAPI(context.request, groupAndProjectName);
    } finally {
        await context.close();
    }
});

test.beforeEach(async ({ page }) => {
    await runBefore(page);
    await page.goto(`/projects/${groupAndProjectName}/settings/access`);
});

test('can assign permissions to user', async ({ page }) => {
    await page.getByTestId('PA_ASSIGN_BUTTON_ID').click();

    await page.getByTestId('PA_USERS_GROUPS_ID').click();
    await page.getByText(`1-${userName}`, { exact: true }).click();
    await page.getByTestId('PA_USERS_GROUPS_TITLE_ID').click();
    await page.getByTestId('PA_ROLE_ID').click();
    await page
        .getByText('full control over the project')
        .click({ force: true });

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp
                .url()
                .includes(
                    `/api/admin/projects/${groupAndProjectName}/access`,
                ) && resp.request().method() === 'POST',
    );
    await page.getByTestId('PA_ASSIGN_CREATE_ID').click();
    await responsePromise;
    await expect(
        page.getByText(`1-${userName}`, { exact: true }),
    ).toBeVisible();
});

test('can assign permissions to group', async ({ page }) => {
    await page.getByTestId('PA_ASSIGN_BUTTON_ID').click();

    await page.getByTestId('PA_USERS_GROUPS_ID').click();
    await page
        .getByText(`1-${groupAndProjectName}`, { exact: true })
        .click({ force: true });
    await page.getByTestId('PA_USERS_GROUPS_TITLE_ID').click();
    await page.getByTestId('PA_ROLE_ID').click();
    await page
        .getByText('full control over the project')
        .click({ force: true });

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp
                .url()
                .includes(
                    `/api/admin/projects/${groupAndProjectName}/access`,
                ) && resp.request().method() === 'POST',
    );
    await page.getByTestId('PA_ASSIGN_CREATE_ID').click();
    await responsePromise;
    await expect(
        page.getByText(`1-${groupAndProjectName}`, { exact: true }),
    ).toBeVisible();
});

test('can edit role', async ({ page }) => {
    await page.getByTestId('PA_EDIT_BUTTON_ID').first().click();

    await page.getByTestId('PA_ROLE_ID').click();
    await page
        .getByRole('listbox')
        .getByText('Owner', { exact: true })
        .click({ force: true });
    await page
        .getByRole('listbox')
        .getByText('Member', { exact: true })
        .click({ force: true });

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp
                .url()
                .includes(
                    `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
                ) && resp.request().method() === 'PUT',
    );
    await page.getByTestId('PA_ASSIGN_CREATE_ID').click();
    await responsePromise;

    await expect(
        page.locator('td a span').filter({ hasText: 'Owner' }),
    ).toHaveCount(2);
    await expect(
        page.locator('td a span').filter({ hasText: 'Member' }),
    ).toHaveCount(1);
});

test('can edit role to multiple roles', async ({ page }) => {
    await page.getByTestId('PA_EDIT_BUTTON_ID').first().click();

    await page.getByTestId('PA_ROLE_ID').click();
    await page
        .getByRole('listbox')
        .getByText('Owner', { exact: true })
        .click({ force: true });

    const responsePromise = page.waitForResponse(
        (resp) =>
            resp
                .url()
                .includes(
                    `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
                ) && resp.request().method() === 'PUT',
    );
    await page.getByTestId('PA_ASSIGN_CREATE_ID').click();
    await responsePromise;

    await expect(
        page.locator('td a span').filter({ hasText: 'Owner' }),
    ).toHaveCount(2);
    await expect(
        page.locator('td a span').filter({ hasText: '2 roles' }),
    ).toHaveCount(1);
});

test('can remove access', async ({ page }) => {
    const responsePromise = page.waitForResponse(
        (resp) =>
            resp
                .url()
                .includes(
                    `/api/admin/projects/${groupAndProjectName}/groups/${groupIds[0]}/roles`,
                ) && resp.request().method() === 'DELETE',
    );

    await page
        .locator('[data-testid="PA_REMOVE_BUTTON_ID"]:not([disabled])')
        .first()
        .click();
    await page.getByText("Yes, I'm sure").click();
    await responsePromise;
    await expect(
        page.getByText(
            `1-${groupAndProjectName} has been removed from project`,
        ),
    ).toBeVisible();
});
