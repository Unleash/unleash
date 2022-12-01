import { FromSchema } from 'json-schema-to-ts';
import { requestPerSecondSchema } from './requests-per-second-schema';
export const requestPerSecondSegmentedSchema = {
    $id: '#/components/schemas/requestPerSecondSegmentedSchema',
    type: 'object',
    required: [],
    properties: {
        clientMetrics: {
            $ref: '#/components/schemas/requestPerSecondSchema',
        },
        adminMetrics: {
            $ref: '#/components/schemas/requestPerSecondSchema',
        },
        additionalProperties: {
            $ref: '#/components/schemas/requestPerSecondSchema',
        },
    },
    components: {
        schemas: {
            requestPerSecondSchema,
        },
    },
} as const;

export type RequestPerSecondSegmentedSchema = FromSchema<
    typeof requestPerSecondSegmentedSchema
>;
