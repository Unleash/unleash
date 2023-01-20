import { variantSchema } from './variant-schema';
import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';

export const pushVariantsSchema = {
    $id: '#/components/schemas/pushVariantsSchema',
    type: 'object',
    properties: {
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
        environments: {
            type: 'array',
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
