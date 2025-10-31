import type { FromSchema } from 'json-schema-to-ts';

export const readyCheckSchema = {
    $id: '#/components/schemas/readyCheckSchema',
    type: 'object',
    description:
        'Used by service orchestrators to decide whether this Unleash instance should be considered ready to serve requests.',
    additionalProperties: false,
    required: ['health'],
    properties: {
        health: {
            description:
                'The readiness state this Unleash instance is in. GOOD if the server is up and running. If the server is unhealthy you will get an unsuccessful http response.',
            type: 'string',
            enum: ['GOOD'],
            example: 'GOOD',
        },
    },
    components: {},
} as const;

export type ReadyCheckSchema = FromSchema<typeof readyCheckSchema>;
