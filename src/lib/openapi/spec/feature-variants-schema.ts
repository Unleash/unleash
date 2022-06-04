import { createSchemaObject, CreateSchemaType } from '../types';
import { variantSchema } from './variant-schema';

const schema = {
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
    'components/schemas': {
        variantSchema,
    },
};

export type FeatureVariantsSchema = CreateSchemaType<typeof schema>;

export const featureVariantsSchema = createSchemaObject(schema);
