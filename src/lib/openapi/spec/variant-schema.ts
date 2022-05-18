import { createSchemaObject, CreateSchemaType } from '../types';
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
            items: { $ref: '#/components/schemas/overrideSchema' },
        },
    },
    'components/schemas': {
        overrideSchema,
    },
} as const;

export type VariantSchema = CreateSchemaType<typeof schema>;

export const variantSchema = createSchemaObject(schema);
