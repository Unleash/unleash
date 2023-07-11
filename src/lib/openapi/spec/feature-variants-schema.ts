import { variantSchema } from './variant-schema';
import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';

export const featureVariantsSchema = {
    $id: '#/components/schemas/featureVariantsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'variants'],
    description: 'A schema for feature toggle variants list.',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'The version of the feature variants schema.',
        },
        variants: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
            description: 'The variants available for a feature toggle.',
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
