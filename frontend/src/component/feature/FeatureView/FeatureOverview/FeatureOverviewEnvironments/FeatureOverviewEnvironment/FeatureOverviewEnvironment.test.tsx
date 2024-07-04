import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import FeatureOverviewEnvironment from './FeatureOverviewEnvironment';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import type { IFeatureStrategy } from 'interfaces/strategy';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/features/featureWithoutStrategies',
        {
            environments: [environmentWithoutStrategies],
        },
    );
};

const strategy = {
    name: 'default',
} as IFeatureStrategy;
const environmentWithoutStrategies = {
    name: 'production',
    enabled: true,
    type: 'production',
    strategies: [],
};

test('should allow to add strategy', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId/strategies/create'
                element={
                    <FeatureOverviewEnvironment
                        env={environmentWithoutStrategies}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/features/featureWithoutStrategies/strategies/create',
            permissions: [{ permission: CREATE_FEATURE_STRATEGY }],
        },
    );

    const button = await screen.findByText('Add strategy');
    expect(button).toBeEnabled();
});
