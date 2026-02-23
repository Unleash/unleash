import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

export const setupProjectEndpoint = () => {
    testServerRoute(server, '/api/admin/projects/default', {
        environments: [
            {
                name: 'development',
                enabled: true,
                type: 'development',
            },
        ],
    });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [
            {
                environment: 'development',
                enabled: true,
                type: 'development',
            },
        ],
        defaultStickiness: 'default',
        name: 'default',
    });
};

export const setupSegmentsEndpoint = () => {
    testServerRoute(server, '/api/admin/segments', {
        segments: [
            {
                id: 1,
                name: 'test',
                constraints: [],
            },
        ],
    });
};

export const setupStrategyEndpoint = () => {
    testServerRoute(server, '/api/admin/strategies/flexibleRollout', {
        displayName: 'Gradual rollout',
        name: 'flexibleRollout',
        parameters: [
            {
                name: 'rollout',
            },
            {
                name: 'stickiness',
            },
            {
                name: 'groupId',
            },
        ],
    });
    testServerRoute(server, '/api/admin/strategies/default', {
        displayName: 'Standard',
        name: 'default',
        description:
            'The standard strategy is strictly on / off for your entire userbase.',
        parameters: [],
    });
};

export const setupFeaturesEndpoint = (
    featureName: string,
    variantName = 'Blue',
) => {
    testServerRoute(
        server,
        `/api/admin/projects/default/features/${featureName}`,
        {
            environments: [
                {
                    name: 'development',
                    type: 'development',
                    strategies: [
                        {
                            id: '1',
                            constraints: [],
                            parameters: {
                                groupId: featureName,
                                rollout: '50',
                                stickiness: 'default',
                            },
                            name: 'flexibleRollout',
                            variants: [{ name: variantName, weight: 50 }],
                        },
                    ],
                },
            ],
            name: featureName,
            project: 'default',
        },
    );
};

export const setupFeaturesEndpointWithBrokenStrategy = (
    featureName: string,
) => {
    testServerRoute(
        server,
        `/api/admin/projects/default/features/${featureName}`,
        {
            environments: [
                {
                    name: 'development',
                    type: 'development',
                    strategies: [
                        {
                            id: '1',
                            constraints: [],
                            parameters: {
                                rollout: '66',
                            },
                            name: 'flexibleRollout',
                            variants: [],
                            segments: [],
                            sortOrder: 1,
                            title: 'broken strategy',
                            disabled: false,
                        },
                    ],
                },
            ],
            name: featureName,
            project: 'default',
        },
    );
};

export const setupFeaturesEndpointWithDefaultStrategy = (
    featureName: string,
) => {
    testServerRoute(
        server,
        `/api/admin/projects/default/features/${featureName}`,
        {
            environments: [
                {
                    name: 'development',
                    type: 'development',
                    strategies: [
                        {
                            id: '1',
                            constraints: [],
                            parameters: {},
                            name: 'default',
                            variants: [],
                            segments: [],
                            sortOrder: 1,
                            disabled: false,
                        },
                    ],
                },
            ],
            name: featureName,
            project: 'default',
        },
    );
};

export const setupUiConfigEndpoint = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: {
                enterprise: '5.7.0-main',
            },
        },
        environment: 'enterprise',
        flags: {
            newStrategyConfiguration: true,
        },
        resourceLimits: {
            featureEnvironmentStrategies: 2,
        },
        unleashUrl: 'example.com',
    });
};

export const setupContextEndpoint = (projects?: string[]) => {
    testServerRoute(server, '/api/admin/context', [
        {
            name: 'appName',
        },
    ]);

    for (const project of projects ?? []) {
        testServerRoute(server, `/api/admin/projects/${project}/context`, [
            {
                name: 'appName2',
            },
        ]);
    }
};
