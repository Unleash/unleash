import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import FeatureOverviewEnvironment from './FeatureOverviewEnvironment';
import {
    testServerRoute,
    testServerSetup,
} from '../../../../../../utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from '../../../../../providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
        },
    });

    testServerRoute(
        server,
        '/api/admin/projects/default/features/featureWithoutStrategies',
        {
            environments: [environmentWithoutStrategies],
        },
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/featureWithManyStrategies',
        {
            environments: [environmentWithManyStrategies],
        },
    );
};

const strategy = {
    name: 'default',
};
const environmentWithoutStrategies = {
    name: 'production',
    enabled: true,
    type: 'production',
    strategies: [],
};
const environmentWithManyStrategies = {
    name: 'production',
    enabled: true,
    type: 'production',
    strategies: [...Array(30).keys()].map(() => strategy),
};

test('should allow to add strategy when no strategies', async () => {
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

test('should not allow to add strategy when limit reached', async () => {
    setupApi();
    render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId/strategies/create'
                element={
                    <FeatureOverviewEnvironment
                        env={environmentWithManyStrategies}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/features/featureWithManyStrategies/strategies/create',
            permissions: [{ permission: CREATE_FEATURE_STRATEGY }],
        },
    );

    await waitFor(async () => {
        const button = await screen.findByText('Add strategy');
        expect(button).toBeDisabled();
    });
});
