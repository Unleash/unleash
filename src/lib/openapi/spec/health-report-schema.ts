import { FromSchema } from 'json-schema-to-ts';
import { healthOverviewSchema } from './health-overview-schema';

export const healthReportSchema = {
    ...healthOverviewSchema,
    $id: '#/components/schemas/healthReportSchema',
    required: [
        ...healthOverviewSchema.required,
        'potentiallyStaleCount',
        'activeCount',
        'staleCount',
    ],
    properties: {
        ...healthOverviewSchema.properties,
        potentiallyStaleCount: {
            type: 'number',
        },
        activeCount: {
            type: 'number',
        },
        staleCount: {
            type: 'number',
        },
    },
} as const;

export type HealthReportSchema = FromSchema<typeof healthReportSchema>;
