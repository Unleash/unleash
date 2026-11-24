import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from '@server/types/permissions';
import { Application } from './Application.tsx';

const server = testServerSetup();

const renderApplication = (applicationOverview: boolean) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { applicationOverview },
    });
    testServerRoute(server, '/api/admin/metrics/applications/checkout', {
        appName: 'checkout',
    });
    testServerRoute(
        server,
        '/api/admin/metrics/applications/checkout/overview',
        {
            environments: [],
            projects: [],
            featureCount: 0,
            issues: { missingStrategies: [] },
        },
    );
    testServerRoute(server, '/api/admin/api-tokens', { tokens: [] });

    render(
        <Routes>
            <Route path='/applications/:name/*' element={<Application />} />
        </Routes>,
        {
            route: '/applications/checkout',
            permissions: [{ permission: ADMIN }],
        },
    );
};

test('without the flag, the page has no Tokens tab and can delete the application', async () => {
    renderApplication(false);

    await screen.findByRole('button', { name: 'Delete application' });
    screen.getByRole('tab', { name: 'Overview' });
    expect(screen.queryByRole('tab', { name: /Tokens/ })).toBeNull();
});

test('with the flag, the page adds a Tokens tab with the token count', async () => {
    renderApplication(true);

    await screen.findByRole('tab', { name: 'Tokens 0' });
    screen.getByRole('button', { name: 'Delete application' });
    expect(screen.queryByRole('button', { name: 'Create token' })).toBeNull();
});
