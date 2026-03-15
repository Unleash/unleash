import type { FromSchema } from 'json-schema-to-ts';
import { adminSessionSchema } from './admin-session-schema.js';

export const adminSessionsSchema = {
    $id: '#/components/schemas/adminSessionsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A list of active sessions in the Unleash instance.',
    required: ['sessions'],
    properties: {
        sessions: {
            type: 'array',
            description: 'A list of active sessions.',
            items: {
                $ref: '#/components/schemas/adminSessionSchema',
            },
        },
    },
    components: {
        schemas: {
            adminSessionSchema,
        },
    },
} as const;

export type AdminSessionsSchema = FromSchema<typeof adminSessionsSchema>;
