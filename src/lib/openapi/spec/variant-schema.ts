import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';
import { DeepMutable } from '../../types/mutable';

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

export type VariantSchema = FromSchema<typeof schema>;

export const variantSchema = schema as DeepMutable<typeof schema>;
