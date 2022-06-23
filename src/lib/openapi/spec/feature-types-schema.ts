import { FromSchema } from 'json-schema-to-ts';
import { featureTypeSchema } from './feature-type-schema';

export const featureTypesSchema = {
    $id: '#/components/schemas/featureTypesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'types'],
    properties: {
        version: {
            type: 'integer',
        },
        types: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureTypeSchema',
            },
        },
    },
    components: {
        schemas: {
            featureTypeSchema,
        },
    },
} as const;

export type FeatureTypesSchema = FromSchema<typeof featureTypesSchema>;
