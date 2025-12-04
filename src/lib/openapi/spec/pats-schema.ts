import type { FromSchema } from 'json-schema-to-ts';
import { patSchema } from './pat-schema.js';

export const patsSchema = {
    $id: '#/components/schemas/patsSchema',
    type: 'object',
    description:
        'Contains a collection of [personal access tokens](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#personal-access-tokens), or PATs. PATs are automatically scoped to the authenticated user.',
    properties: {
        pats: {
            type: 'array',
            description: 'A collection of PATs.',
            items: {
                $ref: patSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            patSchema,
        },
    },
} as const;

export type PatsSchema = FromSchema<typeof patsSchema>;
