import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';

export const variantSchema = {
    $id: '#/components/schemas/variantSchema',
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
        weightType: {
            type: 'string',
        },
        stickiness: {
            type: 'string',
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
        overrides: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/overrideSchema',
            },
        },
    },
    components: {
        schemas: {
            overrideSchema,
        },
    },
} as const;

export type VariantSchema = FromSchema<typeof variantSchema>;
