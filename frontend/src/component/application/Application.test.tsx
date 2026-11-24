import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

test('without the flag, the page offers no token and can delete the application', async () => {
    renderApplication(false);

    await screen.findByRole('button', { name: 'Delete application' });
    expect(screen.queryByRole('button', { name: 'Create token' })).toBeNull();
});

test('with the flag, the header opens the create token panel', async () => {
    renderApplication(true);

    const open = await screen.findByRole('button', { name: 'Create token' });
    // Enabled once the token count is known (the token limit).
    await waitFor(() => expect(open).not.toHaveAttribute('aria-disabled'));
    await userEvent.click(open);

    await screen.findByLabelText('Token name');
});
