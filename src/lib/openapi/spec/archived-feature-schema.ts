import type { FromSchema } from 'json-schema-to-ts';

export const archivedFeatureSchema = {
    $id: '#/components/schemas/archivedFeatureSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'project'],
    description: 'An archived project feature flag definition',
    properties: {
        name: {
            type: 'string',
            example: 'disable-comments',
            description: 'Unique feature name',
        },
        type: {
            type: 'string',
            example: 'kill-switch',
            description:
                'Type of the flag e.g. experiment, kill-switch, release, operational, permission',
        },
        description: {
            type: 'string',
            nullable: true,
            example:
                'Controls disabling of the comments section in case of an incident',
            description: 'Detailed description of the feature',
        },
        project: {
            type: 'string',
            example: 'dx-squad',
            description: 'Name of the project the feature belongs to',
        },
        stale: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the feature is stale based on the age and feature type, otherwise `false`.',
        },
        impressionData: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the impression data collection is enabled for the feature, otherwise `false`.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-28T15:21:39.975Z',
            description: 'The date the feature was created',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-29T15:21:39.975Z',
            description: 'The date the feature was archived',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            deprecated: true,
            example: '2023-01-28T16:21:39.975Z',
            description:
                'The date when metrics where last collected for the feature. This field was deprecated in v5, use the one in featureEnvironmentSchema',
        },
        environments: {
            type: 'array',
            deprecated: true,
            description:
                'The list of environments where the feature can be used',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'my-dev-env',
                        description: 'The name of the environment',
                    },
                    lastSeenAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        example: '2023-01-28T16:21:39.975Z',
                        description:
                            'The date when metrics where last collected for the feature environment',
                    },
                    enabled: {
                        type: 'boolean',
                        example: true,
                        description:
                            '`true` if the feature is enabled for the environment, otherwise `false`.',
                    },
                },
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ArchivedFeatureSchema = FromSchema<typeof archivedFeatureSchema>;
