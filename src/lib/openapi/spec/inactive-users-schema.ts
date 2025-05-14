import { inactiveUserSchema } from './inactive-user-schema.js';
import type { FromSchema } from 'json-schema-to-ts';

export const inactiveUsersSchema = {
    $id: '#/components/schemas/inactiveUsersSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A list of users that has been flagged as inactive',
    required: ['version', 'inactiveUsers'],
    properties: {
        version: {
            description:
                'The version of this schema. Used to keep track of compatibility',
            type: 'integer',
            minimum: 1,
            example: 1,
        },
        inactiveUsers: {
            description: 'The list of users that are flagged as inactive',
            type: 'array',
            items: {
                $ref: '#/components/schemas/inactiveUserSchema',
            },
        },
    },
    components: {
        inactiveUserSchema,
    },
} as const;

export type InactiveUsersSchema = FromSchema<typeof inactiveUsersSchema>;
