import { createSchemaObject, CreateSchemaType } from '../types';
import { patchOperationSchema } from './patch-operation-schema';

const schema = {
    type: 'array',
    items: patchOperationSchema,
} as const;

export type PatchStrategySchema = CreateSchemaType<typeof schema>;

export const patchStrategySchema = createSchemaObject(schema);
