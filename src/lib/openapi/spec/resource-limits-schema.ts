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
    },
    components: {},
} as const;

export type ResourceLimitsSchema = FromSchema<typeof resourceLimitsSchema>;
