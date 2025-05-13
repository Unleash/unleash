import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { ConnectedInstances } from './ConnectedInstances.tsx';
import type { ApplicationEnvironmentInstancesSchemaInstancesItem } from 'openapi';

const server = testServerSetup();

const setupApi = (
    instances: ApplicationEnvironmentInstancesSchemaInstancesItem[],
) => {
    testServerRoute(server, '/api/admin/metrics/applications/my-app/overview', {
        environments: [{ name: 'development' }, { name: 'production' }],
    });
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(
        server,
        '/api/admin/metrics/instances/my-app/environment/development',
        {
            instances,
        },
    );
    testServerRoute(
        server,
        '/api/admin/metrics/instances/my-app/environment/production',
        {
            instances: [
                {
                    instanceId: 'prodInstance',
                    clientIp: 'irrelevant',
                    lastSeen: '2024-02-26T14:00:59.980Z',
                    sdkVersion: 'irrelevant',
                },
            ],
        },
    );
};

test('Display connected instances', async () => {
    setupApi([
        {
            instanceId: 'devInstance1',
            clientIp: '192.168.0.1',
            lastSeen: '2024-02-26T15:00:59.980Z',
            sdkVersion: 'unleash-client-node:5.5.0',
        },
        {
            instanceId: 'devInstance2',
            clientIp: '192.168.0.2',
            lastSeen: '2024-02-26T14:00:59.980Z',
            sdkVersion: 'unleash-client-node:5.5.1',
        },
    ]);
    render(
        <Routes>
            <Route
                path={'/applications/:name/instances'}
                element={<ConnectedInstances />}
            />
        </Routes>,
        {
            route: '/applications/my-app/instances',
        },
    );

    await screen.findByText('development');
    const prodButton = await screen.findByText('production');
    await screen.findByText('devInstance1');
    await screen.findByText('devInstance2');
    await screen.findByText('192.168.0.1');
    await screen.findByText('192.168.0.2');
    await screen.findByText('unleash-client-node:5.5.0');
    await screen.findByText('unleash-client-node:5.5.1');
    expect(screen.queryByText('prodInstance')).not.toBeInTheDocument();

    // check order
    const [, row1, row2] = screen.getAllByRole('row');
    expect(row1.textContent?.includes('devInstance1')).toBe(true);
    expect(row2.textContent?.includes('devInstance2')).toBe(true);

    // switch tab
    prodButton.click();

    await screen.findByText('prodInstance');
    expect(screen.queryByText('devInstance1')).not.toBeInTheDocument();
    expect(window.location.href).toContain(
        'applications/my-app/instances?environment=production',
    );
});

test('Display no connected instances', async () => {
    setupApi([]);
    render(
        <Routes>
            <Route
                path={'/applications/:name/instances'}
                element={<ConnectedInstances />}
            />
        </Routes>,
        {
            route: '/applications/my-app/instances',
        },
    );

    await screen.findByText('development');
    await screen.findByText('production');
    await screen.findByText(
        "There's no data for any connected instances to display. Have you configured your clients correctly?",
    );
});
