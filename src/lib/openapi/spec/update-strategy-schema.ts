import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchemaDefinition } from './strategy-schema';

const schema = {
    ...strategySchemaDefinition,
    required: [],
} as const;

export type UpdateStrategySchema = CreateSchemaType<typeof schema>;

const { 'components/schemas': componentsSchemas, ...rest } = schema;
export const updateStrategySchema = createSchemaObject(rest);
