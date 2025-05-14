import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ProjectApplications } from './ProjectApplications.tsx';
import type { ProjectApplicationSchema } from 'openapi';
import { Route, Routes } from 'react-router-dom';
import { SEARCH_INPUT } from 'utils/testIds';

const server = testServerSetup();

const setupApi = (applications: ProjectApplicationSchema[]) => {
    testServerRoute(server, '/api/admin/projects/default/applications', {
        applications,
        total: applications.length,
    });
    testServerRoute(server, '/api/admin/ui-config', {});
};

test('Display applications list', async () => {
    setupApi([
        {
            name: 'app-one',
            environments: ['development'],
            instances: ['instance1'],
            sdks: [{ name: 'unleash-client-node', versions: ['5.5.0'] }],
        },
        {
            name: 'app-two',
            environments: ['development', 'production'],
            instances: ['instance1', 'instance2'],
            sdks: [
                { name: 'unleash-client-node', versions: ['5.5.0', '5.6.0'] },
                { name: 'unleash-client-java', versions: ['3.5.0'] },
            ],
        },
    ]);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/applications'}
                element={<ProjectApplications />}
            />
        </Routes>,
        {
            route: '/projects/default/applications?query=app',
        },
    );

    await screen.findByText('-one');
    await screen.findByText('1 environment');
    await screen.findByText('1 instance');
    await screen.findByText('1 sdk');

    await screen.findByText('-two');
    await screen.findByText('2 environments');
    await screen.findByText('2 instances');
    await screen.findByText('2 sdks');

    // two highlights
    expect(screen.queryAllByText('app').length).toBe(2);

    expect(screen.getByTestId(SEARCH_INPUT)).toHaveValue('app');
});

test('Display no applications found', async () => {
    setupApi([]);
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/applications'}
                element={<ProjectApplications />}
            />
        </Routes>,
        {
            route: '/projects/default/applications?query=',
        },
    );

    await screen.findByText('No applications found matching your criteria.');
});
