import type { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema.js';
import { projectFeatureEnvironmentSchema } from './project-feature-environment-schema.js';

export const projectFeatureSchema = {
    $id: '#/components/schemas/projectFeatureSchema',
    type: 'object',
    additionalProperties: false,
    required: [
        'name',
        'type',
        'description',
        'stale',
        'favorite',
        'impressionData',
        'createdAt',
        'lastSeenAt',
        'environments',
    ],
    description: 'A project feature flag definition',
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
            example: '2023-01-28T15:21:39.975Z',
            description: 'The date the feature was created',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            deprecated: true,
            example: '2023-01-28T16:21:39.975Z',
            description:
                'The date and time when metrics where last collected for this flag in any environment. This field was deprecated in v5. You should instead use the `lastSeenAt` property on the individual environments listed under the `environments` property.',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectFeatureEnvironmentSchema',
            },
            description:
                'The list of environments where the feature can be used',
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
            projectFeatureEnvironmentSchema,
            tagSchema,
        },
    },
} as const;

export type ProjectFeatureSchema = FromSchema<typeof projectFeatureSchema>;
