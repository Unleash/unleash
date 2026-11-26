import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router';
import type { ApplicationOverviewSchema } from 'openapi';
import { ADMIN } from '@server/types/permissions';
import ApplicationOverview from './ApplicationOverview.tsx';

const server = testServerSetup();

const setupApi = (application: ApplicationOverviewSchema) => {
    testServerRoute(
        server,
        '/api/admin/metrics/applications/my-app/overview',
        application,
    );
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {},
    });
};

test('Display application overview with environments', async () => {
    setupApi({
        environments: [
            {
                name: 'development',
                instanceCount: 999,
                lastSeen: new Date().toISOString(),
                sdks: ['unleash-client-node:5.5.0-beta.0'],
                frontendSdks: [],
                backendSdks: ['unleash-client-node:5.5.0-beta.0'],
                issues: {
                    missingFeatures: [],
                    outdatedSdks: [],
                },
            },
        ],
        issues: { missingStrategies: [] },
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
    await screen.findByText('< 1 minute ago');
    expect(
        screen.queryByRole('region', { name: 'Development' }),
    ).not.toBeInTheDocument();
});

test('Display application overview without environments', async () => {
    setupApi({
        environments: [],
        featureCount: 0,
        issues: {
            missingStrategies: [],
        },
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

    await screen.findByText('No data available.');
});

test('Display application with issues', async () => {
    setupApi({
        environments: [
            {
                name: 'development',
                instanceCount: 999,
                lastSeen: new Date().toISOString(),
                sdks: ['unleash-client-node:5.5.0-beta.0'],
                frontendSdks: [],
                backendSdks: ['unleash-client-node:5.5.0-beta.0'],
                issues: {
                    missingFeatures: ['feature1'],
                    outdatedSdks: [],
                },
            },
        ],
        issues: {
            missingStrategies: ['strategy1'],
        },
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

    await screen.findByText(
        'We detected 1 feature flag defined in the SDK that does not exist in Unleash',
    );
    await screen.findByText(
        'We detected 1 strategy type defined in the SDK that does not exist in Unleash',
    );
    await screen.findByText('feature1');
    await screen.findByText('strategy1');
});

test('with applicationOverview on, shows the issues and the environment cards, not the chart', async () => {
    setupApi({
        environments: [
            {
                name: 'development',
                instanceCount: 999,
                lastSeen: new Date().toISOString(),
                sdks: [],
                frontendSdks: [],
                backendSdks: [],
                issues: { missingFeatures: [], outdatedSdks: [] },
            },
        ],
        issues: { missingStrategies: ['strategy1'] },
        featureCount: 1,
        projects: [],
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { applicationOverview: true },
        resourceLimits: { apiTokens: 10 },
    });
    testServerRoute(server, '/api/admin/environments', { environments: [] });
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });
    render(
        <Routes>
            <Route
                path={'/applications/:name'}
                element={<ApplicationOverview />}
            />
        </Routes>,
        { route: '/applications/my-app', permissions: [{ permission: ADMIN }] },
    );

    await screen.findByRole('region', { name: 'Development' });
    screen.getByText('strategy1');
    expect(
        screen.queryByText('development environment'),
    ).not.toBeInTheDocument();
});
