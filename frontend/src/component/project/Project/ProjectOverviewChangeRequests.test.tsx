import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ProjectOverviewChangeRequests } from './ProjectOverviewChangeRequests';

const server = testServerSetup();

const setupEnterpriseApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { enterprise: 'present' },
        },
    });
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'default',
                changeRequestEnabled: true,
            },
        ],
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/count',
        {
            total: 14,
            approved: 2,
            applied: 0,
            rejected: 0,
            reviewRequired: 10,
            scheduled: 2,
        },
    );
};

test('Show change requests count', async () => {
    setupEnterpriseApi();
    render(<ProjectOverviewChangeRequests project='default' />);

    await screen.findByText('4');
    await screen.findByText('10');
    await screen.findByText('View change requests');
});
