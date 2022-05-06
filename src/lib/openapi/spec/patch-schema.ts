import { createSchemaObject, CreateSchemaType } from '../types';
import { patchOperationSchema } from './patch-operation-schema';

const schema = {
    type: 'array',
    items: patchOperationSchema,
} as const;

export type PatchSchema = CreateSchemaType<typeof schema>;

export const patchSchema = createSchemaObject(schema);
