import { FromSchema } from 'json-schema-to-ts';
import { healthOverviewSchema } from './health-overview-schema';

export const healthReportSchema = {
    ...healthOverviewSchema,
    $id: '#/components/schemas/healthReportSchema',
    description:
        'A report of the current health of the requested project, with datapoints like counters of currently active, stale, and potentially stale feature toggles.',
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
            description: 'The number of potentially stale feature toggles.',
            example: 5,
        },
        activeCount: {
            type: 'number',
            description: 'The number of active feature toggles.',
            example: 2,
        },
        staleCount: {
            type: 'number',
            description: 'The number of stale feature toggles.',
            example: 10,
        },
    },
} as const;

export type HealthReportSchema = FromSchema<typeof healthReportSchema>;
