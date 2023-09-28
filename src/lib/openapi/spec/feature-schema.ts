import { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { tagSchema } from './tag-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { strategyVariantSchema } from './strategy-variant-schema';

export const featureSchema = {
    $id: '#/components/schemas/featureSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description: 'A feature toggle definition',
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
                'Type of the toggle e.g. experiment, kill-switch, release, operational, permission',
        },
        description: {
            type: 'string',
            nullable: true,
            example:
                'Controls disabling of the comments section in case of an incident',
            description: 'Detailed description of the feature',
        },
        archived: {
            type: 'boolean',
            example: true,
            description: '`true` if the feature is archived',
        },
        project: {
            type: 'string',
            example: 'dx-squad',
            description: 'Name of the project the feature belongs to',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description: '`true` if the feature is enabled, otherwise `false`.',
        },
        stale: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the feature is stale based on the age and feature type, otherwise `false`.',
        },
        favorite: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the feature was favorited, otherwise `false`.',
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
            nullable: true,
            example: '2023-01-28T15:21:39.975Z',
            description: 'The date the feature was created',
        },
        archivedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
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
                'The date when metrics where last collected for the feature. This field is deprecated, use the one in featureEnvironmentSchema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureEnvironmentSchema',
            },
            description:
                'The list of environments where the feature can be used',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'The list of feature variants',
            deprecated: true,
        },
        strategies: {
            type: 'array',
            items: {
                type: 'object',
            },
            description: 'This is a legacy field that will be deprecated',
            deprecated: true,
        },
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
            nullable: true,
            description: 'The list of feature tags',
        },
        children: {
            type: 'array',
            description:
                'The list of child feature names. This is an experimental field and may change.',
            items: {
                type: 'string',
                example: 'some-feature',
            },
        },
        dependencies: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['feature'],
                properties: {
                    feature: {
                        description: 'The name of the parent feature',
                        type: 'string',
                        example: 'some-feature',
                    },
                    enabled: {
                        description:
                            'Whether the parent feature is enabled or not',
                        type: 'boolean',
                        example: true,
                    },
                    variants: {
                        description:
                            'The list of variants the parent feature should resolve to. Only valid when feature is enabled.',
                        type: 'array',
                        items: {
                            example: 'some-feature-blue-variant',
                            type: 'string',
                        },
                    },
                },
            },
            description:
                'The list of parent dependencies. This is an experimental field and may change.',
        },
    },
    components: {
        schemas: {
            constraintSchema,
            featureEnvironmentSchema,
            featureStrategySchema,
            strategyVariantSchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type FeatureSchema = FromSchema<typeof featureSchema>;
