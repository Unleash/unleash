import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import FeatureOverviewEnvironment from './FeatureOverviewEnvironment';
import { Route, Routes } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';

const environmentWithoutStrategies = {
    name: 'production',
    enabled: true,
    type: 'production',
    strategies: [],
};

test('should allow to add strategy', async () => {
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
