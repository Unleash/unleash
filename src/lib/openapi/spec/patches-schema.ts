import type { FromSchema } from 'json-schema-to-ts';
import { patchSchema } from './patch-schema.js';

export const patchesSchema = {
    $id: '#/components/schemas/patchesSchema',
    type: 'array',
    description: 'A list of patches',
    items: {
        $ref: '#/components/schemas/patchSchema',
    },
    components: {
        schemas: {
            patchSchema,
        },
    },
} as const;

export type PatchesSchema = FromSchema<typeof patchesSchema>;
