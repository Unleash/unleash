import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureToggleFilters } from './FeatureToggleFilters';
import { FILTER_ITEM } from 'utils/testIds';

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

    render(<FeatureToggleFilters onChange={() => {}} state={{}} />);

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

    render(<FeatureToggleFilters onChange={() => {}} state={{}} />);

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
});

test('should keep filters order when adding a new filter', async () => {
    render(<FeatureToggleFilters onChange={() => {}} state={{}} />);

    const valuesElement = await screen.findByText('Tags');
    expect(valuesElement).toBeInTheDocument();
    valuesElement.click();

    const stateElement = await screen.findByText('State');
    expect(stateElement).toBeInTheDocument();

    stateElement.click();

    const filterItems = screen.getAllByTestId(FILTER_ITEM);
    const filterTexts = filterItems.map((item) => item.textContent);

    expect(filterTexts).toEqual(['Tags', 'State']);
});
