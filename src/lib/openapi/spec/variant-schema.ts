import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
    required: ['name', 'weight', 'weightType', 'stickiness', 'overrides'],
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
        },
        overrides: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/overrideSchema',
            },
        },
    },
} as const;

export type VariantSchema = CreateSchemaType<typeof schema>;

export const variantSchema = createSchemaObject(schema);
