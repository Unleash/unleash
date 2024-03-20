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
};

const setupOssApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'present' },
        },
    });
};

const changeRequests = {
    applied: 0,
    total: 0,
    approved: 0,
    scheduled: 0,
    reviewRequired: 0,
    rejected: 0,
};

test('Show enterprise hints', async () => {
    setupOssApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ChangeRequests changeRequests={changeRequests} />}
            />
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
            <Route
                path={'/projects/:projectId'}
                element={<ChangeRequests changeRequests={changeRequests} />}
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('To be applied');
});
