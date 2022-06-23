import { FromSchema } from 'json-schema-to-ts';

export const cloneFeatureSchema = {
    $id: '#/components/schemas/cloneFeatureSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        replaceGroupId: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type CloneFeatureSchema = FromSchema<typeof cloneFeatureSchema>;
