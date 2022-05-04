import { createSchemaObject, CreateSchemaType } from '../types';
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

export type FeaturesSchema = CreateSchemaType<typeof schema>;

export const featuresSchema = createSchemaObject(schema);
