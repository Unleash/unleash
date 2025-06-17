import type { FromSchema } from 'json-schema-to-ts';

export const impactMetricsSchema = {
    $id: '#/components/schemas/impactMetricsSchema',
    type: 'object',
    description: 'Impact metrics data from Prometheus',
    additionalProperties: true,
    required: [],
    properties: {},
    components: {
        schemas: {},
    },
} as const;

export type ImpactMetricsSchema = FromSchema<typeof impactMetricsSchema>;
