import { FromSchema } from 'json-schema-to-ts';
import { proxyFeatureSchema } from './proxy-feature-schema';

export const proxyFeaturesSchema = {
    $id: '#/components/schemas/proxyFeaturesSchema',
    type: 'object',
    required: ['toggles'],
    additionalProperties: false,
    properties: {
        toggles: {
            type: 'array',
            items: {
                $ref: proxyFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            proxyFeatureSchema,
        },
    },
} as const;

export type ProxyFeaturesSchema = FromSchema<typeof proxyFeaturesSchema>;
