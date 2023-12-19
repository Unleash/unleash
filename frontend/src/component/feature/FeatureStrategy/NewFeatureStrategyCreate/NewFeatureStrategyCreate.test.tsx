import { formatAddStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';

import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { NewFeatureStrategyCreate } from './NewFeatureStrategyCreate';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupProjectEndpoint = () => {
    testServerRoute(server, '/api/admin/projects/default', {
        environments: [
            {
                name: 'development',
                enabled: true,
                type: 'development',
                sortOrder: 2,
                variantCount: 0,
                lastSeenAt: null,
                hasStrategies: true,
                hasEnabledStrategies: true,
            },
        ],
    });
};

const setupSegmentsEndpoint = () => {
    testServerRoute(server, '/api/admin/segments', {
        segments: [
            {
                id: 1,
                name: 'test',
                description: '',
                constraints: [
                    {
                        values: ['pro'],
                        inverted: false,
                        operator: 'IN',
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                createdBy: 'admin',
                createdAt: '2023-12-13T14:31:41.726Z',
                usedInProjects: 0,
                usedInFeatures: 0,
            },
        ],
    });
};

const setupStrategyEndpoint = () => {
    testServerRoute(server, '/api/admin/strategies/flexibleRollout', {
        displayName: 'Gradual rollout',
        name: 'flexibleRollout',
        editable: false,
        description:
            'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.',
        parameters: [
            {
                name: 'rollout',
                type: 'percentage',
                description: '',
                required: false,
            },
            {
                name: 'stickiness',
                type: 'string',
                description:
                    'Used define stickiness. Possible values: default, userId, sessionId, random',
                required: true,
            },
            {
                name: 'groupId',
                type: 'string',
                description:
                    'Used to define a activation groups, which allows you to correlate across feature toggles.',
                required: true,
            },
        ],
        deprecated: false,
        title: null,
    });
};

const setupFeaturesEndpoint = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/features/my-new-feature',
        {
            environments: [
                {
                    name: 'development',
                    lastSeenAt: null,
                    enabled: true,
                    type: 'development',
                    sortOrder: 2,
                    strategies: [],
                },
            ],
            name: 'my-new-feature',
            favorite: false,
            impressionData: false,
            description: null,
            project: 'default',
            stale: false,
            lastSeenAt: null,
            createdAt: '2023-12-14T19:11:43.392Z',
            type: 'release',
            variants: [],
            archived: false,
            dependencies: [],
            children: [],
        },
    );
};

const setupUiConfigEndpoint = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: {
                oss: '',
                enterprise: '5.7.0-main',
            },
            latest: {},
            isLatest: true,
            instanceId: 'cb568db0-42c7-4f79-8218-a0fce19d658b',
        },
        environment: 'enterprise',
        flags: {
            newStrategyConfiguration: true,
        },
    });
};

const setupComponent = () => {
    return render(
        <Routes>
            <Route
                path={
                    'projects/:projectId/features/:featureId/strategies/create'
                }
                element={<NewFeatureStrategyCreate />}
            />
        </Routes>,
        {
            route: 'projects/default/features/my-new-feature/strategies/create?environmentId=development&strategyName=flexibleRollout&defaultStrategy=true',
            permissions: [
                {
                    permission: CREATE_FEATURE_STRATEGY,
                    project: 'default',
                    environment: 'development',
                },
            ],
        },
    );
};

// const setupApi = () => {
//     setupProjectEndpoint();
//     setupSegmentsEndpoint();
//     setupStrategyEndpoint();
//     setupFeaturesEndpoint();
//     setupUiConfigEndpoint();
// };

beforeEach(() => {
    setupProjectEndpoint();
    setupSegmentsEndpoint();
    setupStrategyEndpoint();
    setupFeaturesEndpoint();
    setupUiConfigEndpoint();
});

describe('NewFeatureStrategyCreate', () => {
    // test('formatAddStrategyApiCode', () => {
    //     expect(
    //         formatAddStrategyApiCode(
    //             'projectId',
    //             'featureId',
    //             'environmentId',
    //             { id: 'strategyId' },
    //             'unleashUrl',
    //         ),
    //     ).toMatchInlineSnapshot(`
    //   "curl --location --request POST 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies' \\\\
    //       --header 'Authorization: INSERT_API_KEY' \\\\
    //       --header 'Content-Type: application/json' \\\\
    //       --data-raw '{
    //     \\"id\\": \\"strategyId\\"
    //   }'"
    // `);
    // });

    test('should navigate tabs', async () => {
        setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        expect(slider).toHaveValue('100');

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        await waitFor(() => {
            expect(screen.getByText('Segments')).toBeInTheDocument();
        });

        const variantEl = screen.getByText('Variants');
        fireEvent.click(variantEl);

        await waitFor(() => {
            expect(screen.getByText('Add variant')).toBeInTheDocument();
        });
    });

    test('should change general settings', async () => {
        const wrapper = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });
        const slider = await screen.findByRole('slider', { name: /rollout/i });
        //const groupIdInput = await screen.getByLabelText('groupId');

        expect(slider).toHaveValue('100');
        // expect(groupIdInput).toHaveValue('testid');

        // fireEvent.change(slider, { target: { value: '50' } });
        // fireEvent.change(groupIdInput, { target: { value: 'newGroupId' } });

        // expect(slider).toHaveValue('50');
        // expect(groupIdInput).toHaveValue('newGroupId');
    });
});
