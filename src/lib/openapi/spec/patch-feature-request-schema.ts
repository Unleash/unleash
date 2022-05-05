import { createSchemaObject, CreateSchemaType } from '../types';
import { patchFeatureOperationSchema } from './patch-feature-operation-schema';

const schema = {
    type: 'array',
    items: patchFeatureOperationSchema,
} as const;

export type PatchFeatureRequestSchema = CreateSchemaType<typeof schema>;

export const patchFeatureRequestSchema = createSchemaObject(schema);
