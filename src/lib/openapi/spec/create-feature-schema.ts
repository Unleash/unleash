import { FromSchema } from 'json-schema-to-ts';

export const createFeatureSchema = {
    $id: '#/components/schemas/createFeatureSchema',
    type: 'object',
    description: 'Data used to create a new feature toggle.',
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
                "The feature toggle's [type](https://docs.getunleash.io/reference/feature-toggle-types). One of experiment, kill-switch, release, operational, or permission",
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
