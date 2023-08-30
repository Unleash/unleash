import { FromSchema } from 'json-schema-to-ts';
import { doraFeaturesSchema } from './dora-features-schema';

export const projectDoraMetricsSchema = {
    $id: '#/components/schemas/projectDoraMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features'],
    description: 'A projects dora metrics',
    properties: {
        features: {
            type: 'array',
            items: { $ref: '#/components/schemas/doraFeaturesSchema' },
        },
    },
    components: {
        schemas: {
            doraFeaturesSchema,
        },
    },
} as const;

export type ProjectDoraMetricsSchema = FromSchema<
    typeof projectDoraMetricsSchema
>;
