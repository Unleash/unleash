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
});
