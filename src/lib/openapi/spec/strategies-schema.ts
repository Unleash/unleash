import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    properties: {
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
    },
} as const;

export type StrategiesSchema = CreateSchemaType<typeof schema>;

export const strategiesSchema = createSchemaObject(schema);
