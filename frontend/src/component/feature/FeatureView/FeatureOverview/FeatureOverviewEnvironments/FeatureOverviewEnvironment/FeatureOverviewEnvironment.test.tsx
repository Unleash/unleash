import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureOverviewEnvironment } from './FeatureOverviewEnvironment.tsx';
import { Route, Routes } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';

const renderRoute = (element: ReactNode, permissions: any[] = []) =>
    render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId/strategies/create'
                element={element}
            />
        </Routes>,
        {
            route: '/projects/default/features/featureId/strategies/create',
            permissions,
        },
    );

describe('FeatureOverviewEnvironment', () => {
    test('should allow to add strategy', async () => {
        renderRoute(
            <FeatureOverviewEnvironment
                environment={{
                    name: 'production',
                    enabled: false,
                    type: 'production',
                    strategies: [],
                }}
            />,
            [{ permission: CREATE_FEATURE_STRATEGY }],
        );

        const button = await screen.findByText('Add strategy');
        expect(button).toBeEnabled();
    });

    test("should disable add button if permissions don't allow for it", async () => {
        render(
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureId/strategies/create'
                    element={
                        <FeatureOverviewEnvironment
                            environment={{
                                name: 'production',
                                enabled: false,
                                type: 'production',
                                strategies: [],
                            }}
                        />
                    }
                />
            </Routes>,
            {
                route: '/projects/default/features/featureWithoutStrategies/strategies/create',
                permissions: [],
            },
        );

        const button = await screen.findByText('Add strategy');
        expect(button).toHaveAttribute('aria-disabled', 'true');
    });
});
