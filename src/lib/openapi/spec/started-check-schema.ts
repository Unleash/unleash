import type { FromSchema } from 'json-schema-to-ts';

export const startedCheckSchema = {
    $id: '#/components/schemas/startedCheckSchema',
    type: 'object',
    description:
        'Used by service orchestrators to decide whether this Unleash instance has completed startup and is ready to serve traffic.',
    additionalProperties: false,
    required: ['health'],
    properties: {
        health: {
            description:
                'The startup state of this Unleash instance. GOOD if the server has completed initial cache warming and is ready to serve traffic. If the server is still starting you will get an unsuccessful http response.',
            type: 'string',
            enum: ['GOOD'],
            example: 'GOOD',
        },
    },
    components: {},
} as const;

export type StartedCheckSchema = FromSchema<typeof startedCheckSchema>;
