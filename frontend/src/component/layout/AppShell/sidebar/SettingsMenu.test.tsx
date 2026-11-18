import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SettingsMenu } from './SettingsMenu.tsx';

const server = testServerSetup();

beforeEach(() => {
    localStorage.removeItem('unleash-theme');
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
        permissions: [],
        feedback: [],
        splash: {},
    });
});

const openSettings = async () => {
    const button = screen.getByRole('button', { name: 'Settings' });
    await userEvent.click(button);
    return button;
};

test('opens the settings menu with the signed-in user', async () => {
    render(<SettingsMenu />);

    const button = await openSettings();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
});

test('shows the username when the user has no name', async () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1, username: 'admin' },
        permissions: [],
        feedback: [],
        splash: {},
    });
    render(<SettingsMenu />);

    await openSettings();

    expect(await screen.findByText('admin')).toBeInTheDocument();
});

test('links to the profile page and the external privacy policy', async () => {
    render(<SettingsMenu />);

    await openSettings();

    expect(
        screen.getByRole('menuitem', { name: 'Profile settings' }),
    ).toHaveAttribute('href', '/profile');
    expect(
        screen.getByRole('menuitem', { name: 'Privacy policy' }),
    ).toHaveAttribute('href', 'https://www.getunleash.io/privacy-policy');
});

test('closes the menu after choosing profile settings', async () => {
    render(<SettingsMenu />);
    const button = await openSettings();

    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Profile settings' }),
    );

    expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('logs out by posting to the logout endpoint', async () => {
    render(<SettingsMenu />);

    await openSettings();

    const logOut = screen.getByRole('menuitem', { name: 'Log out' });
    expect(logOut).toHaveAttribute('type', 'submit');
    const form = logOut.closest('form');
    expect(form).toHaveAttribute('action', '/logout');
    expect(form).toHaveAttribute('method', 'POST');
});

const chooseTheme = async (label: string) => {
    await userEvent.click(screen.getByRole('menuitem', { name: /Theme/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: label }));
};

test('switches the theme from the theme submenu', async () => {
    render(<SettingsMenu />);
    await openSettings();

    await chooseTheme('Dark');
    await openSettings();

    expect(screen.getByRole('menuitem', { name: /Theme/ })).toHaveTextContent(
        'Dark',
    );
});

test('closes the menu after choosing a theme', async () => {
    render(<SettingsMenu />);
    const button = await openSettings();

    await chooseTheme('Dark');

    expect(button).toHaveAttribute('aria-expanded', 'false');
});
