import { FromSchema } from 'json-schema-to-ts';
import { groupUserModelSchema } from './group-user-model-schema';
import { userSchema } from './user-schema';

export const groupSchema = {
    $id: '#/components/schemas/groupSchema',
    type: 'object',
    additionalProperties: true,
    required: ['name'],
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
        mappingsSSO: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        createdBy: {
            type: 'string',
            nullable: true,
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
        projects: {
            type: 'array',
            items: {
                type: 'string',
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
