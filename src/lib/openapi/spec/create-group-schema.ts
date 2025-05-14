import type { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema.js';

export const createGroupSchema = {
    $id: '#/components/schemas/createGroupSchema',
    type: 'object',
    required: ['name'],
    description: 'A detailed information about a user group',
    properties: {
        name: groupSchema.properties.name,
        description: groupSchema.properties.description,
        mappingsSSO: groupSchema.properties.mappingsSSO,
        rootRole: groupSchema.properties.rootRole,
        users: {
            type: 'array',
            description: 'A list of users belonging to this group',
            items: {
                type: 'object',
                description: 'A minimal user object',
                required: ['user'],
                properties: {
                    user: {
                        type: 'object',
                        description: 'A minimal user object',
                        required: ['id'],
                        properties: {
                            id: {
                                description: 'The user id',
                                type: 'integer',
                                minimum: 0,
                                example: 123,
                            },
                        },
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type CreateGroupSchema = FromSchema<typeof createGroupSchema>;
