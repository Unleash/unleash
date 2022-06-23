import { variantSchema } from './variant-schema';
import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';

export const featureVariantsSchema = {
    $id: '#/components/schemas/featureVariantsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'variants'],
    properties: {
        version: {
            type: 'integer',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
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

export type FeatureVariantsSchema = FromSchema<typeof featureVariantsSchema>;
