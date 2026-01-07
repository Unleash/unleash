import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeaturesOverviewToggleFilters } from './FeaturesOverviewToggleFilters.tsx';

const server = testServerSetup();

test('should render projects filters when more than one project', async () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            {
                name: 'default',
                id: 'default',
            },
            {
                name: 'second',
                id: 'Second',
            },
        ],
    });

    render(<FeaturesOverviewToggleFilters onChange={() => {}} state={{}} />);

    await screen.findByText('Project');
});

test('should not render projects filters when less than two project', async () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            {
                name: 'default',
                id: 'default',
            },
        ],
    });

    render(<FeaturesOverviewToggleFilters onChange={() => {}} state={{}} />);

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
});
