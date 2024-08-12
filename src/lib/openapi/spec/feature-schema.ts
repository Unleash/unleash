import type { FromSchema } from 'json-schema-to-ts';
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
    description: 'A feature flag definition',
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
        createdBy: {
            type: 'object',
            description: 'User who created the feature flag',
            additionalProperties: false,
            required: ['id', 'name', 'imageUrl'],
            properties: {
                id: {
                    description: 'The user id',
                    type: 'integer',
                    example: 123,
                },
                name: {
                    description: 'Name of the user',
                    type: 'string',
                    example: 'User',
                },
                imageUrl: {
                    description: `URL used for the user profile image`,
                    type: 'string',
                    example: 'https://example.com/242x200.png',
                },
            },
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
                'The date when metrics where last collected for the feature. This field was deprecated in v5, use the one in featureEnvironmentSchema',
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
            description:
                'This was deprecated in v5 and will be removed in a future major version',
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
        lifecycle: {
            type: 'object',
            description: 'Current lifecycle stage of the feature',
            additionalProperties: false,
            required: ['stage', 'enteredStageAt'],
            properties: {
                stage: {
                    description: 'The name of the current lifecycle stage',
                    type: 'string',
                    enum: [
                        'initial',
                        'pre-live',
                        'live',
                        'completed',
                        'archived',
                    ],
                    example: 'initial',
                },
                enteredStageAt: {
                    description: 'When the feature entered this stage',
                    type: 'string',
                    format: 'date-time',
                    example: '2023-01-28T15:21:39.975Z',
                },
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
        collaborators: {
            type: 'object',
            required: ['users'],
            description:
                'Information related to users who have made changes to this feature flage.',
            properties: {
                users: {
                    description:
                        'Users who have made any changes to this feature flags. The list is sorted in reverse chronological order (most recent changes first)',
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'name', 'imageUrl'],
                        description: 'A simple representation of a user.',
                        properties: {
                            id: {
                                description: "The user's id",
                                type: 'integer',
                                example: 123,
                            },
                            name: {
                                description:
                                    "The user's name, username, or email (prioritized in that order). If none of those are present, this property will be set to the string `unknown`",
                                type: 'string',
                                example: 'User',
                            },
                            imageUrl: {
                                description: `The URL to the user's profile image`,
                                type: 'string',
                                example: 'https://example.com/242x200.png',
                            },
                        },
                    },
                },
            },
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
