import { FromSchema } from 'json-schema-to-ts';
import { groupUserModelSchema } from './group-user-model-schema';
import { userSchema } from './user-schema';

export const groupSchema = {
    $id: '#/components/schemas/groupSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'users'],
    properties: {
        id: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        createdBy: {
            type: 'string',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupUserModelSchema',
            },
        },
    },
    components: {
        schemas: {
            groupUserModelSchema,
            userSchema,
        },
    },
} as const;

export type GroupSchema = FromSchema<typeof groupSchema>;
