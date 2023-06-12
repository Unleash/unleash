import { FromSchema } from 'json-schema-to-ts';

export const healthCheckSchema = {
    $id: '#/components/schemas/healthCheckSchema',
    type: 'object',
    description:
        'Used by service orchestrators to decide whether this Unleash instance should be marked as healthy or unhealthy',
    additionalProperties: false,
    required: ['health'],
    properties: {
        health: {
            description:
                'The state this Unleash instance is in. GOOD if everything is ok, BAD if the instance should be restarted',
            type: 'string',
            enum: ['GOOD', 'BAD'],
            example: 'GOOD',
        },
    },
    components: {},
} as const;

export type HealthCheckSchema = FromSchema<typeof healthCheckSchema>;
