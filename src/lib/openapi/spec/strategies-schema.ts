import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';

export const schema = {
    type: 'array',
    items: strategySchema,
} as const;

export type StrategiesSchema = CreateSchemaType<typeof schema>;

export const strategiesSchema = createSchemaObject(schema);
