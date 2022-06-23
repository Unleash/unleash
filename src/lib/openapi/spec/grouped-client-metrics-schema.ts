import { FromSchema } from 'json-schema-to-ts';

export const groupedClientMetricsSchema = {
    $id: '#/components/schemas/groupedClientMetricsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment', 'timestamp', 'yes', 'no'],
    properties: {
        environment: {
            type: 'string',
        },
        timestamp: {
            type: 'string',
            format: 'date-time',
        },
        yes: {
            type: 'number',
        },
        no: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type GroupedClientMetricsSchema = FromSchema<
    typeof groupedClientMetricsSchema
>;
