import { variantSchema } from './variant-schema.js';
import type { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema.js';

export const pushVariantsSchema = {
    $id: '#/components/schemas/pushVariantsSchema',
    type: 'object',
    description: 'Data used when copying variants into a new environment.',
    properties: {
        variants: {
            type: 'array',
            description: 'The variants to write to the provided environments',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
        environments: {
            type: 'array',
            description: 'The enviromnents to write the provided variants to',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            variantSchema,
            overrideSchema,
        },
    },
} as const;

export type PushVariantsSchema = FromSchema<typeof pushVariantsSchema>;
