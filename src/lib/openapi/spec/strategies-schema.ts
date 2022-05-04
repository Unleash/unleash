import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'array',
    additionalProperties: false,
    required: ['strategies'],
    items: {
        $ref: '#/components/schemas/strategySchema',
    },
} as const;

export type StrategiesSchema = CreateSchemaType<typeof schema>;

export const strategiesSchema = createSchemaObject(schema);
