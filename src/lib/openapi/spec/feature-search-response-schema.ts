import type { FromSchema } from 'json-schema-to-ts';
import { variantSchema } from './variant-schema';
import { constraintSchema } from './constraint-schema';
import { overrideSchema } from './override-schema';
import { parametersSchema } from './parameters-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { tagSchema } from './tag-schema';
import { strategyVariantSchema } from './strategy-variant-schema';
import { featureSearchEnvironmentSchema } from './feature-search-environment-schema';

export const featureSearchResponseSchema = {
    $id: '#/components/schemas/featureSearchResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'dependencyType',
        'type',
        'project',
        'stale',
        'favorite',
        'impressionData',
        'createdAt',
        'environments',
        'segments',
    ],
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
        dependencyType: {
            type: 'string',
            enum: ['parent', 'child', null],
            nullable: true,
            example: 'parent',
            description:
                "The type of dependency. 'parent' means that the feature is a parent feature, 'child' means that the feature is a child feature.",
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
                $ref: '#/components/schemas/featureSearchEnvironmentSchema',
            },
            description:
                'The list of environments where the feature can be used',
        },
        segments: {
            type: 'array',
            description: 'The list of segments the feature is enabled for.',
            example: ['pro-users', 'main-segment'],
            items: {
                type: 'string',
            },
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
    },
    components: {
        schemas: {
            constraintSchema,
            featureSearchEnvironmentSchema,
            featureStrategySchema,
            strategyVariantSchema,
            overrideSchema,
            parametersSchema,
            variantSchema,
            tagSchema,
        },
    },
} as const;

export type FeatureSearchResponseSchema = FromSchema<
    typeof featureSearchResponseSchema
>;
