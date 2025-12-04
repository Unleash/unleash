import type { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema.js';

export const createFeatureSchema = {
    $id: '#/components/schemas/createFeatureSchema',
    type: 'object',
    description: 'Data used to create a new feature flag.',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
            example: 'disable-comments',
            description: 'Unique feature name',
        },
        type: {
            enum: [
                'experiment',
                'kill-switch',
                'release',
                'operational',
                'permission',
            ],
            example: 'release',
            description:
                "The feature flag's [type](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types). One of experiment, kill-switch, release, operational, or permission",
        },
        description: {
            type: 'string',
            nullable: true,
            example:
                'Controls disabling of the comments section in case of an incident',
            description: 'Detailed description of the feature',
        },
        impressionData: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the impression data collection is enabled for the feature, otherwise `false`.',
        },
        tags: {
            type: 'array',
            description: 'Tags to add to the feature.',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type CreateFeatureSchema = FromSchema<typeof createFeatureSchema>;
