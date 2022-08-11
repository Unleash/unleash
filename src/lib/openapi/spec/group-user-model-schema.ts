import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';

export const groupUserModelSchema = {
    $id: '#/components/schemas/groupUserModelSchema',
    type: 'object',
    additionalProperties: false,
    required: ['user'],
    properties: {
        joinedAt: {
            type: 'string',
            format: 'date-time',
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
