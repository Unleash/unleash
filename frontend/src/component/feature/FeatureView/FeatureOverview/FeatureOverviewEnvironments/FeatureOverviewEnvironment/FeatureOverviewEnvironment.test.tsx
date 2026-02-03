import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureOverviewEnvironment } from './FeatureOverviewEnvironment.tsx';
import { Route, Routes } from 'react-router-dom';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

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

const setupEnterpriseEndpoints = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: {
                enterprise: '1.0.0',
            },
        },
        environment: 'enterprise',
    });
    testServerRoute(server, '/api/admin/release-plan-templates', [
        {
            id: 'template-1',
            name: 'Test Template',
            description: 'A test release template',
        },
    ]);
    testServerRoute(server, '/api/admin/environments/project/default', [
        {
            name: 'production',
            enabled: true,
            type: 'production',
        },
    ]);
};

const setupOssEndpoints = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: {},
        },
        flags: {},
        resourceLimits: {
            featureEnvironmentStrategies: 30,
        },
    });
    testServerRoute(server, '/api/admin/environments/project/default', [
        {
            name: 'production',
            enabled: true,
            type: 'production',
        },
    ]);
};

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

    test('shows release template suggestion for production environment on enterprise', async () => {
        setupEnterpriseEndpoints();
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

        expect(
            await screen.findByText('Choose a release template'),
        ).toBeInTheDocument();
    });

    test('does not show release template suggestion for non-production environment on enterprise', async () => {
        setupEnterpriseEndpoints();
        testServerRoute(server, '/api/admin/environments/project/default', [
            {
                name: 'development',
                enabled: true,
                type: 'development',
            },
        ]);

        renderRoute(
            <FeatureOverviewEnvironment
                environment={{
                    name: 'development',
                    enabled: false,
                    type: 'development',
                    strategies: [],
                }}
            />,
            [{ permission: CREATE_FEATURE_STRATEGY }],
        );

        expect(
            await screen.findByText(/default strategy/i),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Choose a release template'),
        ).not.toBeInTheDocument();
    });

    test('does not show release template suggestion for production environment on OSS', async () => {
        setupOssEndpoints();
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

        expect(await screen.findByText('production')).toBeInTheDocument();
        expect(
            screen.queryByText('Choose a release template'),
        ).not.toBeInTheDocument();
    });

    test('does not show release template suggestion when environment has activations', async () => {
        setupEnterpriseEndpoints();
        renderRoute(
            <FeatureOverviewEnvironment
                environment={{
                    name: 'production',
                    enabled: true,
                    type: 'production',
                    strategies: [
                        {
                            id: '1',
                            name: 'flexibleRollout',
                            parameters: {},
                            constraints: [],
                        },
                    ],
                }}
            />,
            [{ permission: CREATE_FEATURE_STRATEGY }],
        );

        expect(await screen.findByText('production')).toBeInTheDocument();

        expect(
            screen.queryByText('Choose a release template'),
        ).not.toBeInTheDocument();
    });

    test('opens strategy menu dialog with release templates filter when clicking release template suggestion', async () => {
        const user = userEvent.setup();
        setupEnterpriseEndpoints();
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

        const releaseTemplateButton = await screen.findByText(
            'Choose a release template',
        );
        await user.click(releaseTemplateButton);
        const releaseTemplatesFilter = screen.queryByRole('button', {
            name: /release templates/i,
        });

        expect(releaseTemplatesFilter).toBeInTheDocument();
        expect(releaseTemplatesFilter).toHaveAttribute('aria-pressed', 'true');
    });
});
