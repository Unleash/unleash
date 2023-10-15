import { FromSchema } from 'json-schema-to-ts';
import { doraFeaturesSchema } from './dora-features-schema';

export const projectDoraMetricsSchema = {
    $id: '#/components/schemas/projectDoraMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features'],
    description: 'A projects dora metrics',
    properties: {
        projectAverage: {
            type: 'number',
            description:
                'The average time it takes a feature toggle to be enabled in production. The measurement unit is days.',
        },
        features: {
            type: 'array',
            items: { $ref: '#/components/schemas/doraFeaturesSchema' },
            description:
                'An array of objects containing feature toggle name and timeToProduction values. The measurement unit of timeToProduction is days.',
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
