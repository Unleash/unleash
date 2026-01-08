import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav.tsx';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

test('decode URI encoded path in breadcrumbs nav', async () => {
    render(
        <Routes>
            <Route
                path={'/applications/:name/:instance'}
                element={<BreadcrumbNav />}
            />
        </Routes>,
        {
            route: '/applications/my%20app/my%20instance',
        },
    );

    await screen.findByText('applications');
    await screen.findByText('my app');
    await screen.findByText('my instance');
});

test('use project name when in a project path', async () => {
    testServerRoute(server, '/api/admin/projects/my-project/overview', {
        name: 'My Test Project',
        onboardingStatus: { status: 'onboarded' },
        version: '1.0.0',
    });

    render(
        <Routes>
            <Route path={'/projects/:projectId'} element={<BreadcrumbNav />} />
        </Routes>,
        {
            route: '/projects/my-project',
        },
    );

    await screen.findByText('My Test Project');
});
