import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ProjectDoraMetricsSchema } from 'openapi';
import { LeadTimeForChanges } from './LeadTimeForChanges';
import { Route, Routes } from 'react-router-dom';

const server = testServerSetup();

const setupApi = (outdatedSdks: ProjectDoraMetricsSchema) => {
    testServerRoute(server, '/api/admin/projects/default/dora', outdatedSdks);
};

test('Show outdated SDKs and apps using them', async () => {
    setupApi({
        features: [
            {
                name: 'ABCD',
                timeToProduction: 57,
            },
        ],
        projectAverage: 67,
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<LeadTimeForChanges />}
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('Lead time for changes (per release toggle)');
    await screen.findByText('ABCD');
    await screen.findByText('57 days');
    await screen.findByText('Low');
    await screen.findByText('10 days');
});
