import { FromSchema } from 'json-schema-to-ts';
import { requestsPerSecondSchema } from './requests-per-second-schema';
export const requestsPerSecondSegmentedSchema = {
    $id: '#/components/schemas/requestsPerSecondSegmentedSchema',
    type: 'object',
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
