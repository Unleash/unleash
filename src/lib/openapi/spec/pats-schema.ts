import { FromSchema } from 'json-schema-to-ts';
import { patSchema } from './pat-schema';

export const patsSchema = {
    $id: '#/components/schemas/patsSchema',
    type: 'object',
    description:
        'Contains a collection of [Personal Access Tokens](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens).',
    properties: {
        pats: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/patSchema',
            },
            description: 'A collection of Personal Access Tokens',
        },
    },
    components: {
        schemas: {
            patSchema,
        },
    },
} as const;

export type PatsSchema = FromSchema<typeof patsSchema>;
