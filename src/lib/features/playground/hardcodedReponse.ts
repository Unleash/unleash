const sharedDetails = {
    isEnabled: true,
    isEnabledInCurrentEnvironment: true,
    strategies: {
        result: true,
        data: [
            {
                name: 'flexibleRollout',
                id: '9422b4bb-5f8a-4df5-863a-c2a4c4d83af7',
                disabled: false,
                parameters: {
                    groupId: 'test',
                    rollout: '100',
                    stickiness: 'default',
                },
                result: {
                    enabled: true,
                    evaluationStatus: 'complete',
                },
                constraints: [
                    {
                        inverted: false,
                        values: ['2', '4', '6', '8', '10'],
                        operator: 'IN',
                        contextName: 'userId',
                        caseInsensitive: false,
                        result: true,
                    },
                ],
                segments: [],
            },
        ],
    },
    variant: {
        name: 'a',
        payload: {
            type: 'string',
            value: 'a',
        },
        enabled: true,
    },
    variants: [
        {
            name: 'a',
            weight: 334,
            payload: {
                type: 'string',
                value: 'a',
            },
            overrides: [],
            stickiness: 'default',
            weightType: 'variable',
        },
        {
            name: 'b',
            weight: 333,
            payload: {
                type: 'string',
                value: 'b',
            },
            overrides: [],
            stickiness: 'default',
            weightType: 'variable',
        },
        {
            name: 'c',
            weight: 333,
            payload: {
                type: 'string',
                value: 'c',
            },
            overrides: [],
            stickiness: 'default',
            weightType: 'variable',
        },
    ],
};
const shareEnv = [
    {
        ...sharedDetails,
        context: {
            appName: 'playground',
            userId: '1',
            channel: 'web',
        },
    },
    {
        ...sharedDetails,
        context: {
            appName: 'playground',
            userId: '2',
            channel: 'web',
        },
    },
    {
        ...sharedDetails,
        context: {
            appName: 'playground',
            userId: '1',
            channel: 'mobile',
        },
    },
    {
        ...sharedDetails,
        context: {
            appName: 'playground',
            userId: '2',
            channel: 'mobile',
        },
    },
];
export const fixedAdvancedPlaygroundResponse = {
    input: {
        environments: ['development', 'production'],
        projects: ['default'],
        context: {
            appName: 'playground',
            userId: '1,2',
            channel: 'web,mobile',
        },
    },
    features: [
        {
            environments: {
                development: shareEnv,
                production: shareEnv,
            },

            projectId: 'default',
            name: 'featureA',
        },
        {
            environments: {
                development: shareEnv,
                production: shareEnv,
            },

            projectId: 'default',
            name: 'featureB',
        },
    ],
};
