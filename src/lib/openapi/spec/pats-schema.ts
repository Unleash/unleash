import { FromSchema } from 'json-schema-to-ts';
import { patSchema } from './pat-schema';

export const patsSchema = {
    $id: '#/components/schemas/patsSchema',
    type: 'object',
    properties: {
        pats: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/patSchema',
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
