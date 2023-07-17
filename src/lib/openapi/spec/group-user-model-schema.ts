import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';

export const groupUserModelSchema = {
    $id: '#/components/schemas/groupUserModelSchema',
    type: 'object',
    additionalProperties: false,
    required: ['user'],
    description: 'Details for the single user belonging to a group',
    properties: {
        joinedAt: {
            description: 'A date when the user join the group',
            type: 'string',
            format: 'date-time',
            example: '2023-06-30T11:41:00.123Z',
        },
        createdBy: {
            description: 'A user who added the group user',
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
