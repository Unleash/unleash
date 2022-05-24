import { createSchemaObject, CreateSchemaType } from '../types';
import { featureSchema } from './feature-schema';
import { parametersSchema } from './parameters-schema';
import { variantSchema } from './variant-schema';
import { overrideSchema } from './override-schema';
import { featureEnvironmentSchema } from './feature-environment-schema';
import { featureStrategySchema } from './feature-strategy-schema';
import { constraintSchema } from './constraint-schema';
import { strategySchema } from './strategy-schema';

const schema = {
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
    'components/schemas': {
        featureSchema,
        constraintSchema,
        featureEnvironmentSchema,
        featureStrategySchema,
        overrideSchema,
        parametersSchema,
        strategySchema,
        variantSchema,
    },
} as const;

export type FeaturesSchema = CreateSchemaType<typeof schema>;

export const featuresSchema = createSchemaObject(schema);
