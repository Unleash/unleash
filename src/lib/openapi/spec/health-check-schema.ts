import { FromSchema } from 'json-schema-to-ts';

export const healthCheckSchema = {
    $id: '#/components/schemas/healthCheckSchema',
    type: 'object',
    additionalProperties: false,
    required: ['health'],
    properties: {
        health: {
            type: 'string',
            enum: ['GOOD', 'BAD'],
        },
    },
    components: {},
} as const;

export type HealthCheckSchema = FromSchema<typeof healthCheckSchema>;
