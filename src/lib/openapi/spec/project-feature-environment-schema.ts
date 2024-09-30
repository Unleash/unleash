import type { FromSchema } from 'json-schema-to-ts';

export const projectFeatureEnvironmentSchema = {
    $id: '#/components/schemas/projectFeatureEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'type',
        'enabled',
        'sortOrder',
        'variantCount',
        'lastSeenAt',
    ],
    description: 'A detailed description of the feature environment',
    properties: {
        name: {
            type: 'string',
            example: 'my-dev-env',
            description: 'The name of the environment',
        },
        type: {
            type: 'string',
            example: 'development',
            description: 'The type of the environment',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the feature is enabled for the environment, otherwise `false`.',
        },
        sortOrder: {
            type: 'number',
            example: 3,
            description:
                'The sort order of the feature environment in the feature environments list',
        },
        variantCount: {
            type: 'number',
            description: 'The number of defined variants',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T16:21:39.975Z',
            description:
                'The date when metrics where last collected for the feature environment',
        },
        hasStrategies: {
            type: 'boolean',
            description: 'Whether the feature has any strategies defined.',
        },
        hasEnabledStrategies: {
            type: 'boolean',
            description:
                'Whether the feature has any enabled strategies defined.',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ProjectFeatureEnvironmentSchema = FromSchema<
    typeof projectFeatureEnvironmentSchema
>;
