import { FromSchema } from 'json-schema-to-ts';

export const createFeatureSchema = {
    $id: '#/components/schemas/createFeatureSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        impressionData: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type CreateFeatureSchema = FromSchema<typeof createFeatureSchema>;
