import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { ProjectFeatureToggles } from './ProjectFeatureToggles';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { screen } from '@testing-library/react';
import { BATCH_SELECTED_COUNT } from 'utils/testIds';

const server = testServerSetup();

const setupApi = () => {
    const features = [{ name: 'featureA' }, { name: 'featureB' }];
    testServerRoute(server, '/api/admin/search/features', {
        features,
        total: features.length,
    });
    testServerRoute(server, '/api/admin/ui-config', {});
};

test('selects project features', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <ProjectFeatureToggles
                        environments={['development', 'production']}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );
    await screen.findByText('featureA');
    await screen.findByText('featureB');
    await screen.findByText('Feature flags (2)');

    const [selectAll, selectFeatureA, selectFeatureB] =
        screen.queryAllByRole('checkbox');

    // batch select
    selectAll.click();
    let selectedCount = screen.getByTestId(BATCH_SELECTED_COUNT);
    expect(selectedCount.textContent).toBe('2');

    // batch deselect
    selectAll.click();
    expect(screen.queryByTestId(BATCH_SELECTED_COUNT)).not.toBeInTheDocument();

    // select a single item
    selectFeatureA.click();
    selectedCount = screen.getByTestId(BATCH_SELECTED_COUNT);
    expect(selectedCount.textContent).toBe('1');

    // deselect a single item
    selectFeatureA.click();
    expect(screen.queryByTestId(BATCH_SELECTED_COUNT)).not.toBeInTheDocument();
});
