import type { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema.js';

export const groupUserModelSchema = {
    $id: '#/components/schemas/groupUserModelSchema',
    type: 'object',
    additionalProperties: false,
    required: ['user'],
    description: 'Details for a single user belonging to a group',
    properties: {
        joinedAt: {
            description: 'The date when the user joined the group',
            type: 'string',
            format: 'date-time',
            example: '2023-06-30T11:41:00.123Z',
        },
        createdBy: {
            description:
                'The username of the user who added this user to this group',
            type: 'string',
            nullable: true,
            example: 'admin',
        },
        user: {
            $ref: '#/components/schemas/userSchema',
        },
    },
    components: {
        schemas: {
            userSchema,
        },
    },
} as const;

export type GroupUserModelSchema = FromSchema<typeof groupUserModelSchema>;
