import { FromSchema } from 'json-schema-to-ts';
import { clientMetricsSchema } from './client-metrics-schema';

export const proxyMetricsSchema = {
    $id: '#/components/schemas/proxyMetricsSchema',
    allOf: [{ $ref: '#/components/schemas/clientMetricsSchema' }],
    components: {
        schemas: {
            clientMetricsSchema,
        },
    },
} as const;

export type ProxyMetricsSchema = FromSchema<typeof proxyMetricsSchema>;
