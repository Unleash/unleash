import { beforeEach, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { mockPendingAccessRequest } from 'component/admin/users/AccessRequestsNotifications/accessRequestsTestServer.ts';
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

const renderSettingsMenu = (options?: Parameters<typeof render>[1]) =>
    render(
        <SettingsMenu
            onConfigureWorkspace={() => {}}
            onAdminSettings={() => {}}
        />,
        options,
    );

const openSettings = async () => {
    const button = screen.getByRole('button', { name: 'Settings' });
    await userEvent.click(button);
    return button;
};

test('opens the settings menu with the signed-in user', async () => {
    renderSettingsMenu();

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
    renderSettingsMenu();

    await openSettings();

    expect(await screen.findByText('admin')).toBeInTheDocument();
});

test('links to the profile page and the external privacy policy', async () => {
    renderSettingsMenu();

    await openSettings();

    expect(
        screen.getByRole('menuitem', { name: 'Profile settings' }),
    ).toHaveAttribute('href', '/profile');
    expect(
        screen.getByRole('menuitem', { name: 'Privacy policy' }),
    ).toHaveAttribute('href', 'https://www.getunleash.io/privacy-policy');
});

test('lets admins invite people from the users page', async () => {
    renderSettingsMenu({ permissions: [{ permission: ADMIN }] });

    await openSettings();

    expect(
        screen.getByRole('menuitem', { name: 'Invite people' }),
    ).toHaveAttribute('href', '/admin/users');
});

test('does not offer inviting people to non-admins', async () => {
    renderSettingsMenu();

    await openSettings();

    expect(
        screen.queryByRole('menuitem', { name: 'Invite people' }),
    ).not.toBeInTheDocument();
});

test('offers configuring the workspace to everyone', async () => {
    renderSettingsMenu();

    await openSettings();

    expect(
        screen.getByRole('menuitem', { name: 'Configure workspace' }),
    ).toHaveAccessibleDescription('Settings that apply to all projects');
});

test('offers admin settings to everyone', async () => {
    renderSettingsMenu();

    await openSettings();

    expect(
        screen.getByRole('menuitem', { name: 'Admin settings' }),
    ).toHaveAccessibleDescription(
        'Users, access, API tokens, security and more',
    );
});

test('points admins to pending access requests through admin settings', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
    });
    mockPendingAccessRequest(server);
    renderSettingsMenu({ permissions: [{ permission: ADMIN }] });
    const button = screen.getByRole('button', { name: /Settings/ });

    expect(
        await within(button).findByLabelText('Pending access requests'),
    ).toBeInTheDocument();

    await userEvent.click(button);

    expect(
        within(
            screen.getByRole('menuitem', { name: /Admin settings/ }),
        ).getByLabelText('Pending access requests'),
    ).toBeInTheDocument();
});

test('closes the menu after choosing profile settings', async () => {
    renderSettingsMenu();
    const button = await openSettings();

    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Profile settings' }),
    );

    expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('closes the menu after choosing to invite people', async () => {
    renderSettingsMenu({ permissions: [{ permission: ADMIN }] });
    const button = await openSettings();

    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Invite people' }),
    );

    expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('closes the menu after choosing to configure the workspace', async () => {
    renderSettingsMenu();
    const button = await openSettings();

    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Configure workspace' }),
    );

    expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('closes the menu after choosing admin settings', async () => {
    renderSettingsMenu();
    const button = await openSettings();

    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Admin settings' }),
    );

    expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('logs out by posting to the logout endpoint', async () => {
    renderSettingsMenu();

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
    renderSettingsMenu();
    await openSettings();

    await chooseTheme('Dark');
    await openSettings();

    expect(screen.getByRole('menuitem', { name: /Theme/ })).toHaveTextContent(
        'Dark',
    );
});

test('closes the menu after choosing a theme', async () => {
    renderSettingsMenu();
    const button = await openSettings();

    await chooseTheme('Dark');

    expect(button).toHaveAttribute('aria-expanded', 'false');
});
