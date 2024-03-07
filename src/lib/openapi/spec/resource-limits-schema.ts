import { FromSchema } from 'json-schema-to-ts';

export const resourceLimitsSchema = {
    $id: '#/components/schemas/resourceLimitsSchema',
    type: 'object',
    description: 'A map of resource names and their limits.',
    additionalProperties: false,
    properties: {
        segmentValues: {
            type: 'number',
            example: 10,
            description: 'The maximum number of values per segment allowed.',
        },
        strategySegments: {
            type: 'number',
            example: 10,
            description: 'The maximum number of strategy segments allowed.',
        },
        actionSetActions: {
            type: 'number',
            example: 10,
            description:
                'The maximum number of actions per action set allowed.',
        },
        actionSetsPerProject: {
            type: 'number',
            example: 10,
            description:
                'The maximum number of action set definitions per project allowed.',
        },
        actionSetFilters: {
            type: 'number',
            example: 10,
            description:
                'The maximum number of filters per action set allowed.',
        },
        actionSetFilterValues: {
            type: 'number',
            example: 10,
            description:
                'The maximum number of filter values inside an action set allowed.',
        },
        signalEndpoints: {
            type: 'number',
            example: 10,
            description: 'The maximum number of signal endpoints allowed.',
        },
        signalTokensPerEndpoint: {
            type: 'number',
            example: 10,
            description:
                'The maximum number of signal tokens per endpoint allowed.',
        },
    },
    components: {},
} as const;

export type ResourceLimitsSchema = FromSchema<typeof resourceLimitsSchema>;
