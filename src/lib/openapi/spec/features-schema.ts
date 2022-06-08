import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { constraintSchema } from './constraint-schema';
import { strategySchema } from './strategy-schema';

export const featuresSchema = {
    $id: '#/components/schemas/featuresSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'features'],
    properties: {
        version: {
            type: 'integer',
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
            featureSchema,
            overrideSchema,
            parametersSchema,
            strategySchema,
            variantSchema,
        },
    },
} as const;

export type FeaturesSchema = FromSchema<typeof featuresSchema>;
