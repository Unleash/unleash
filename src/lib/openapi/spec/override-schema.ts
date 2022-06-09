import { FromSchema } from 'json-schema-to-ts';

export const overrideSchema = {
    $id: '#/components/schemas/overrideSchema',
    type: 'object',
    additionalProperties: false,
    required: ['contextName', 'values'],
    properties: {
        contextName: {
            type: 'string',
        },
        values: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type OverrideSchema = FromSchema<typeof overrideSchema>;
