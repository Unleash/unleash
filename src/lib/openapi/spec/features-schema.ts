import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
    type: 'object',
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
} as const;

export type FeaturesSchema = CreateSchemaType<typeof schema>;

export const featuresSchema = createSchemaObject(schema);
