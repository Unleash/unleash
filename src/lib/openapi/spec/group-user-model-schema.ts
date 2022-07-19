import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';

export const groupUserModelSchema = {
    $id: '#/components/schemas/groupUserModelSchema',
    type: 'object',
    additionalProperties: false,
    required: ['role', 'user'],
    properties: {
        joinedAt: {
            type: 'string',
            format: 'date-time',
        },
        role: {
            type: 'string',
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
