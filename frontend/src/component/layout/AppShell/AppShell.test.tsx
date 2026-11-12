import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { AppShell } from './AppShell.tsx';

const server = testServerSetup();

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
