import { render } from 'utils/testRenderer';
import { CopyFeatureToggle } from './CopyFeature.tsx';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupServerRoutes = (changeRequestsEnabled = true) => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Open Source',
        flags: {
            changeRequests: true,
        },
        versionInfo: {
            current: { oss: '4.18.0-beta.5', enterprise: '4.17.0-beta.1' },
        },
        disablePasswordAuth: false,
    });

    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: null,
                changeRequestEnabled: false,
            },
            {
                environment: 'production',
                type: 'production',
                requiredApprovals: 1,
                changeRequestEnabled: changeRequestsEnabled,
            },
        ],
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/someFeature',
        { name: 'someFeature' },
    );
};
test('should render an alert when change request is enabled in any env when copying feature', async () => {
    setupServerRoutes();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId/copy'}
                element={<CopyFeatureToggle />}
            />
        </Routes>,
        {
            route: '/projects/default/features/someFeature/copy',
            permissions: [{ permission: CREATE_FEATURE }],
        },
    );

    await screen.findByText(
        'Copy functionality is disabled for this project because change request is enabled for at least one environment in this project.',
    );
});

test('should not render an alert when change request is disabled when copying feature', async () => {
    setupServerRoutes(false);
    render(
        <Routes>
            <Route
                path={'projects/:projectId/features/:featureId/copy'}
                element={<CopyFeatureToggle />}
            />
        </Routes>,
        {
            route: '/projects/default/features/someFeature/copy',
            permissions: [{ permission: CREATE_FEATURE }],
        },
    );

    const alert = screen.queryByText(
        'Copy functionality is disabled for this project because change request is enabled for at least one environment in this project.',
    );
    expect(alert).not.toBeInTheDocument();
});
