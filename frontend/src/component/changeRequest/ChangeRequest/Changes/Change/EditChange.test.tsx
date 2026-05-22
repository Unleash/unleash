import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { EditChange } from './EditChange.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const featureName = 'my-feature';
const project = 'default';
const environment = 'development';

const setupEndpoints = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '5.7.0' } },
        environment: 'enterprise',
        flags: {},
        unleashUrl: 'example.com',
    });
    testServerRoute(
        server,
        `/api/admin/projects/${project}/features/${featureName}`,
        {
            name: featureName,
            project,
            environments: [
                {
                    name: environment,
                    type: 'development',
                    strategies: [
                        {
                            id: 'strategy-1',
                            name: 'flexibleRollout',
                            constraints: [],
                            parameters: {
                                rollout: '50',
                                groupId: featureName,
                                stickiness: 'default',
                            },
                            variants: [],
                        },
                    ],
                },
            ],
            variants: [],
            dependencies: [],
            children: [],
        },
    );
    testServerRoute(server, '/api/admin/strategies/flexibleRollout', {
        displayName: 'Gradual rollout',
        name: 'flexibleRollout',
        parameters: [
            { name: 'rollout' },
            { name: 'stickiness' },
            { name: 'groupId' },
        ],
    });
    testServerRoute(
        server,
        `/api/admin/projects/${project}/change-requests/config`,
        [],
    );
    testServerRoute(server, '/api/admin/segments', { segments: [] });
    testServerRoute(server, '/api/admin/context', []);
};

const setupComponent = () => {
    const change = {
        id: 1,
        action: 'updateStrategy' as const,
        payload: {
            id: 'strategy-1',
            name: 'flexibleRollout',
            constraints: [],
            parameters: {
                rollout: '50',
                groupId: featureName,
                stickiness: 'default',
            },
            segments: [],
            variants: [],
        },
    };

    return render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={
                    <EditChange
                        change={change}
                        changeRequestId={1}
                        featureId={featureName}
                        environment={environment}
                        open={true}
                        onSubmit={vi.fn()}
                        onClose={vi.fn()}
                    />
                }
            />
        </Routes>,
        {
            route: `/projects/${project}/features/${featureName}`,
            permissions: [
                { permission: UPDATE_FEATURE_STRATEGY, project, environment },
            ],
        },
    );
};

beforeEach(() => {
    setupEndpoints();
});

describe('EditChange', () => {
    test('should not show stale data notification when feature loads', async () => {
        setupComponent();

        await screen.findByText('Save strategy');

        expect(
            screen.queryByText('Your data is stale'),
        ).not.toBeInTheDocument();
    });
});
