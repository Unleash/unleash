import { beforeEach, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { AppShell } from './AppShell.tsx';

const server = testServerSetup();

beforeEach(() => {
    localStorage.clear();
});

// Before ui-config loads isEnterprise() is already false, so asserting an
// absent link is only meaningful once the config is known to be loaded.
const UiConfigLoaded = () => {
    const { loading } = useUiConfig();
    return loading ? null : 'ui config loaded';
};

test('links Home to the personal dashboard', () => {
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
        'href',
        '/personal',
    );
});

test('links Projects and Flags overview in the Workspace section', () => {
    render(<AppShell>content</AppShell>);

    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    expect(workspace.getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'href',
        '/projects',
    );
    expect(
        workspace.getByRole('link', { name: 'Flags overview' }),
    ).toHaveAttribute('href', '/search');
});

test('reveals Playground, Analytics and Impact views under More', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        flags: { impactViews: true },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    expect(
        workspace.queryByRole('link', { name: 'Playground' }),
    ).not.toBeInTheDocument();

    await userEvent.click(workspace.getByRole('button', { name: 'More' }));

    expect(workspace.getByRole('link', { name: 'Playground' })).toHaveAttribute(
        'href',
        '/playground',
    );
    expect(workspace.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
        'href',
        '/insights',
    );
    expect(
        workspace.getByRole('link', { name: 'Impact views' }),
    ).toHaveAttribute('href', '/impact-views');
});

test('hides the More items again with Less', async () => {
    render(<AppShell>content</AppShell>);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.click(screen.getByRole('button', { name: 'Less' }));

    expect(
        screen.queryByRole('link', { name: 'Playground' }),
    ).not.toBeInTheDocument();
});

test('keeps More open after the sidebar remounts', async () => {
    const { unmount } = render(<AppShell>content</AppShell>);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    unmount();

    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    expect(
        screen.getByRole('link', { name: 'Playground' }),
    ).toBeInTheDocument();
});

test('shows only Playground under More on oss', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: 'version' } },
        flags: { impactViews: true },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    await userEvent.click(workspace.getByRole('button', { name: 'More' }));

    expect(
        workspace.getByRole('link', { name: 'Playground' }),
    ).toBeInTheDocument();
    expect(
        workspace.queryByRole('link', { name: 'Analytics' }),
    ).not.toBeInTheDocument();
    expect(
        workspace.queryByRole('link', { name: 'Impact views' }),
    ).not.toBeInTheDocument();
});

test('shows change requests on enterprise', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        environment: 'Enterprise',
    });

    render(<AppShell>content</AppShell>);

    expect(
        await screen.findByRole('link', { name: 'Change requests' }),
    ).toHaveAttribute('href', '/change-requests');
});

test('hides change requests on oss', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: 'version' } },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    expect(
        screen.queryByRole('link', { name: 'Change requests' }),
    ).not.toBeInTheDocument();
});
