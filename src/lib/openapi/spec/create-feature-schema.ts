import { FromSchema } from 'json-schema-to-ts';

export const createFeatureSchema = {
    $id: '#/components/schemas/createFeatureSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
            example: 'disable-comments',
            description: 'Unique feature name',
        },
        type: {
            type: 'string',
            example: 'release',
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
        impressionData: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the impression data collection is enabled for the feature, otherwise `false`.',
        },
    },
    components: {},
} as const;

export type CreateFeatureSchema = FromSchema<typeof createFeatureSchema>;
