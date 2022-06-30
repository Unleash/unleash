import { FromSchema } from 'json-schema-to-ts';

export const clientVariantSchema = {
    $id: '#/components/schemas/clientVariantSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'weight'],
    properties: {
        name: {
            type: 'string',
        },
        weight: {
            type: 'number',
        },
        payload: {
            type: 'object',
            required: ['type', 'value'],
            properties: {
                type: {
                    type: 'string',
                },
                value: {
                    type: 'string',
                },
            },
        },
    },
    components: {},
} as const;

export type ClientVariantSchema = FromSchema<typeof clientVariantSchema>;
