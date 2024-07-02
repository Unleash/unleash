import type { FromSchema } from 'json-schema-to-ts';

export const resourceLimitsSchema = {
    $id: '#/components/schemas/resourceLimitsSchema',
    type: 'object',
    description: 'A map of resource names and their limits.',
    required: [
        'segmentValues',
        'strategySegments',
        'actionSetActions',
        'actionSetsPerProject',
        'actionSetFilters',
        'actionSetFilterValues',
        'signalEndpoints',
        'signalTokensPerEndpoint',
        'featureEnvironmentStrategies',
        'constraintValues',
        'environments',
        'projects',
    ],
    additionalProperties: false,
    properties: {
        segmentValues: {
            type: 'integer',
            example: 10,
            description: 'The maximum number of values per segment allowed.',
        },
        strategySegments: {
            type: 'integer',
            example: 10,
            description: 'The maximum number of strategy segments allowed.',
        },
        actionSetActions: {
            type: 'integer',
            example: 10,
            description:
                'The maximum number of actions per action set allowed.',
        },
        actionSetsPerProject: {
            type: 'integer',
            example: 10,
            description:
                'The maximum number of action set definitions per project allowed.',
        },
        actionSetFilters: {
            type: 'integer',
            example: 10,
            description:
                'The maximum number of filters per action set allowed.',
        },
        actionSetFilterValues: {
            type: 'integer',
            example: 10,
            description:
                'The maximum number of filter values inside an action set allowed.',
        },
        signalEndpoints: {
            type: 'integer',
            example: 10,
            description: 'The maximum number of signal endpoints allowed.',
        },
        signalTokensPerEndpoint: {
            type: 'integer',
            example: 10,
            description:
                'The maximum number of signal tokens per endpoint allowed.',
        },
        featureEnvironmentStrategies: {
            type: 'integer',
            example: 30,
            description:
                'The maximum number of feature environment strategies allowed.',
        },
        constraintValues: {
            type: 'integer',
            example: 250,
            description:
                'The maximum number of values for a single constraint.',
        },
        environments: {
            type: 'integer',
            minimum: 1,
            example: 50,
            description: 'The maximum number of environments allowed.',
        },
        apiTokens: {
            type: 'integer',
            minimum: 0,
            example: 2000,
            description:
                'The maximum number of SDK and admin API tokens you can have at the same time. This limit applies only to server-side and client-side SDK tokens and to admin tokens. Personal access tokens are not subject to this limit. The limit applies to the total number of tokens across all projects in your organization.',
        },
        projects: {
            type: 'integer',
            minimum: 1,
            example: 500,
            description: 'The maximum number of projects allowed.',
        },
    },
    components: {},
} as const;

export type ResourceLimitsSchema = FromSchema<typeof resourceLimitsSchema>;
