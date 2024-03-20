import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ProjectOverviewSchema } from 'openapi';
import { Route, Routes } from 'react-router-dom';
import { FlagTypesUsed } from './FlagTypesUsed';

const server = testServerSetup();

const setupApi = (overview: ProjectOverviewSchema) => {
    testServerRoute(server, '/api/admin/projects/default/overview', overview);
};

test('Show outdated SDKs and apps using them', async () => {
    setupApi({
        name: 'default',
        version: 2,
        featureTypeCounts: [
            {
                type: 'release',
                count: 57,
            },
        ],
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <FlagTypesUsed
                        featureTypeCounts={[{ type: 'release', count: 57 }]}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('Release');
    await screen.findByText('57');
});
