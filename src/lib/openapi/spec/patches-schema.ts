import { createSchemaObject, CreateSchemaType } from '../schema';
import { patchSchema } from './patch-schema';

const schema = {
    type: 'array',
    items: patchSchema,
} as const;

export type PatchesSchema = CreateSchemaType<typeof schema>;

export const patchesSchema = createSchemaObject(schema);
