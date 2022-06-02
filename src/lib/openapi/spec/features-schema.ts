import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { featureSchema } from './feature-schema';

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
            items: featureSchema,
        },
    },
} as const;

export type FeaturesSchema = FromSchema<typeof schema>;

export const featuresSchema = schema as DeepMutable<typeof schema>;
