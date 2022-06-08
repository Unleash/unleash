import { FromSchema } from 'json-schema-to-ts';
import { patchSchema } from './patch-schema';

export const patchesSchema = {
    $id: '#/components/schemas/patchesSchema',
    type: 'array',
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
