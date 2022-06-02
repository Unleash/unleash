import { createSchemaObject, CreateSchemaType } from '../schema';
import { overrideSchema } from './override-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'weight', 'weightType', 'stickiness'],
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
            items: overrideSchema,
        },
    },
} as const;

export type VariantSchema = CreateSchemaType<typeof schema>;

export const variantSchema = createSchemaObject(schema);
