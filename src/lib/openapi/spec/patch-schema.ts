import { createSchemaObject, CreateSchemaType } from '../types';
import { patchOperationSchema } from './patch-operation-schema';

const schema = {
    type: 'array',
    items: {
        $ref: '#/components/schemas/patchOperationSchema',
    },
    'components/schemas': {
        patchOperationSchema: patchOperationSchema,
    },
} as const;

export type PatchSchema = CreateSchemaType<typeof schema>;
const { 'components/schemas': componentsSchemas, ...rest } = schema;
export const patchSchema = createSchemaObject(rest);
