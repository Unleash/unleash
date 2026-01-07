import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import ContextList from './ContextList.tsx';

const server = testServerSetup();

const setupRoutes = () => {
    testServerRoute(server, 'api/admin/context', [
        {
            description: 'Allows you to constrain on application name',
            legalValues: [],
            name: 'appName',
            sortOrder: 2,
            stickiness: false,
            usedInProjects: 3,
            usedInFeatures: 2,
            createdAt: '2023-05-24T06:23:07.797Z',
        },
    ]);
};

test('should show the count of projects and features used in', async () => {
    setupRoutes();

    render(<ContextList />);

    await screen.findByText('2 feature flags');
    await screen.findByText('3 projects');
});
