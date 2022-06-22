import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';

export const usersSearchSchema = {
    $id: '#/components/schemas/usersSearchSchema',
    type: 'array',
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
