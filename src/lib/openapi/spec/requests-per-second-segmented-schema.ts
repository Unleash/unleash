import type { FromSchema } from 'json-schema-to-ts';
import { requestsPerSecondSchema } from './requests-per-second-schema.js';
export const requestsPerSecondSegmentedSchema = {
    $id: '#/components/schemas/requestsPerSecondSegmentedSchema',
    type: 'object',
    description: 'Get usage metrics separated by client and admin paths',
    properties: {
        clientMetrics: {
            $ref: '#/components/schemas/requestsPerSecondSchema',
        },
        adminMetrics: {
            $ref: '#/components/schemas/requestsPerSecondSchema',
        },
    },
    components: {
        schemas: {
            requestsPerSecondSchema,
        },
    },
} as const;

export type RequestsPerSecondSegmentedSchema = FromSchema<
    typeof requestsPerSecondSegmentedSchema
>;
