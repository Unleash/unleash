import { FromSchema } from 'json-schema-to-ts';
import { proxyFeatureSchema } from './proxy-feature-schema';

export const proxyFeaturesSchema = {
    $id: '#/components/schemas/proxyFeaturesSchema',
    type: 'object',
    required: ['toggles'],
    additionalProperties: false,
    description: 'Frontend SDK features list',
    properties: {
        toggles: {
            description: 'The actual features returned to the Frontend SDK',
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
