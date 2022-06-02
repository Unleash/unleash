import { createSchemaObject, CreateSchemaType } from '../schema';
import { strategySchemaDefinition } from './strategy-schema';

const schema = {
    ...strategySchemaDefinition,
    required: [],
} as const;

export type UpdateStrategySchema = CreateSchemaType<typeof schema>;

export const updateStrategySchema = createSchemaObject(schema);
