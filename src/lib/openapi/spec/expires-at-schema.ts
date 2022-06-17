import { FromSchema } from 'json-schema-to-ts';

export const expiresAtSchema = {
    $id: '#/components/schemas/expiresAtSchema',
    type: 'object',
    additionalProperties: false,
    required: ['expiresAt'],
    properties: {
        expiresAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type ExpiresAtSchema = FromSchema<typeof expiresAtSchema>;
