import { FromSchema } from 'json-schema-to-ts';

export const nameSchema = {
    $id: '#/components/schemas/nameSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type NameSchema = FromSchema<typeof nameSchema>;
