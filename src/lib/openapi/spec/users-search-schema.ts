import type { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema.js';

export const usersSearchSchema = {
    $id: '#/components/schemas/usersSearchSchema',
    type: 'array',
    description: 'A list of users',
    items: {
        $ref: '#/components/schemas/userSchema',
    },
    components: {
        schemas: {
            userSchema,
        },
    },
} as const;

export type UsersSearchSchema = FromSchema<typeof usersSearchSchema>;
