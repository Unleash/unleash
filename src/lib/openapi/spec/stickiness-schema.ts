import { FromSchema } from 'json-schema-to-ts';

export const stickinessSchema = {
    $id: '#/components/schemas/stickinessSchema',
    type: 'object',
    additionalProperties: false,
    required: ['stickiness'],
    properties: {
        stickiness: {
            type: 'string',
            example: 'userId',
        },
    },
    components: {},
} as const;

export type StickinessSchema = FromSchema<typeof stickinessSchema>;
