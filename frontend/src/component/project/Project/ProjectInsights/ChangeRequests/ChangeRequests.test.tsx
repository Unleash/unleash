import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { ChangeRequests } from './ChangeRequests';

const server = testServerSetup();

const setupEnterpriseApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { enterprise: 'present' },
        },
    });
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

const setupOssApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'present' },
        },
    });
};

test('Show enterprise hints', async () => {
    setupOssApi();
    render(
        <Routes>
            <Route path={'/projects/:projectId'} element={<ChangeRequests />} />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('Enterprise feature');
});

test('Show change requests info', async () => {
    setupEnterpriseApi();
    render(
        <Routes>
            <Route path={'/projects/:projectId'} element={<ChangeRequests />} />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('To be applied');
    await screen.findByText('10');
    await screen.findByText('4');
    await screen.findByText('14');
});
