import type { FromSchema } from 'json-schema-to-ts';
import { featureLinkSchema } from './feature-link-schema.js';

export const featureLinksSchema = {
    $id: '#/components/schemas/featureLinksSchema',
    type: 'object',
    description: 'A list of links for a feature',
    required: ['feature', 'links'],
    additionalProperties: false,
    properties: {
        feature: {
            type: 'string',
            description: 'The name of the child feature.',
            example: 'child_feature',
        },
        links: {
            type: 'array',
            description: 'List of feature links',
            items: {
                $ref: '#/components/schemas/featureLinkSchema',
            },
        },
    },
    components: {
        schemas: {
            featureLinkSchema,
        },
    },
} as const;

export type FeatureLinksSchema = FromSchema<typeof featureLinksSchema>;
