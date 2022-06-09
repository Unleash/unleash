import { FromSchema } from 'json-schema-to-ts';

export const idSchema = {
    $id: '#/components/schemas/idSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id'],
    properties: {
        id: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type IdSchema = FromSchema<typeof idSchema>;
