import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { ApplicationOverviewSchema } from '../../openapi';
import ApplicationOverview from './ApplicationOverview';

const server = testServerSetup();

const setupApi = (application: ApplicationOverviewSchema) => {
    testServerRoute(
        server,
        '/api/admin/metrics/applications/my-app/overview',
        application,
    );
    testServerRoute(server, '/api/admin/ui-config', {});
};

test('Display application overview with environments', async () => {
    setupApi({
        environments: [
            {
                name: 'development',
                instanceCount: 999,
                lastSeen: '2024-02-22T20:20:24.740',
                sdks: ['unleash-client-node:5.5.0-beta.0'],
            },
        ],
        issues: [],
        featureCount: 1,
        projects: ['default'],
    });
    render(
        <Routes>
            <Route
                path={'/applications/:name'}
                element={<ApplicationOverview />}
            />
        </Routes>,
        {
            route: '/applications/my-app',
        },
    );

    await screen.findByText('my-app');
    await screen.findByText('Everything looks good!');
    await screen.findByText('development environment');
    await screen.findByText('999');
    await screen.findByText('unleash-client-node:5.5.0-beta.0');
    await screen.findByText('2024-02-22T20:20:24.740');
});

test('Display application overview without environments', async () => {
    setupApi({
        environments: [],
        featureCount: 0,
        issues: [],
        projects: ['default'],
    });
    render(
        <Routes>
            <Route
                path={'/applications/:name'}
                element={<ApplicationOverview />}
            />
        </Routes>,
        {
            route: '/applications/my-app',
        },
    );

    await screen.findByText('my-app');
    await screen.findByText('No data available.');
});
