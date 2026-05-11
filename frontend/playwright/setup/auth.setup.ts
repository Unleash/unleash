import { expect, test as setup } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

const AUTH_USER = process.env.AUTH_USER || 'admin';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'unleash4all';

setup('authenticate', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('LOGIN_EMAIL_ID').locator('input').fill(AUTH_USER);
    await page
        .getByTestId('LOGIN_PASSWORD_ID')
        .locator('input')
        .fill(AUTH_PASSWORD);
    await page.getByTestId('LOGIN_BUTTON').click();
    await expect(page.getByTestId('HEADER_USER_AVATAR')).toBeVisible();
    await page.context().storageState({ path: AUTH_FILE });
});
