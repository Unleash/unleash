import { createSchemaObject, CreateSchemaType } from '../types';
import { patchStrategyOperationSchema } from './patch-strategy-operation-schema';

const schema = {
    type: 'array',
    items: patchStrategyOperationSchema,
} as const;

export type PatchStrategySchema = CreateSchemaType<typeof schema>;

export const patchStrategySchema = createSchemaObject(schema);
