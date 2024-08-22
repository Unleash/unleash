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
};

export const setupSegmentsEndpoint = () => {
    testServerRoute(server, '/api/admin/segments', {
        segments: [
            {
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
        unleashUrl: 'example.com',
    });
};

export const setupContextEndpoint = () => {
    testServerRoute(server, '/api/admin/context', [
        {
            name: 'appName',
        },
    ]);
};
