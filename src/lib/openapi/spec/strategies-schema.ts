import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';

export const schema = {
    type: 'array',
    additionalProperties: false,
    required: [],
    items: strategySchema,
} as const;

export type StrategiesSchema = CreateSchemaType<typeof schema>;

export const strategiesSchema = createSchemaObject(schema);
