import { FromSchema } from 'json-schema-to-ts';

export const cloneFeatureSchema = {
    $id: '#/components/schemas/cloneFeatureSchema',
    type: 'object',
    required: ['name'],
    description: 'Copy of a feature with a new name',
    properties: {
        name: {
            type: 'string',
            description: 'The name of the new feature',
            example: 'new-feature',
        },
        replaceGroupId: {
            type: 'boolean',
            description:
                'Use new feature name as group ID in order to create different hashing for stickiness',
        },
    },
    components: {},
} as const;

export type CloneFeatureSchema = FromSchema<typeof cloneFeatureSchema>;
