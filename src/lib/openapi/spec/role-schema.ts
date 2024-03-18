import type { FromSchema } from 'json-schema-to-ts';

export const roleSchema = {
    $id: '#/components/schemas/roleSchema',
    type: 'object',
    description:
        'A role holds permissions to allow Unleash to decide what actions a role holder is allowed to perform',
    additionalProperties: false,
    required: ['id', 'type', 'name'],
    properties: {
        id: {
            type: 'integer',
            description: 'The role id',
            example: 9,
            minimum: 0,
        },
        type: {
            description:
                'A role can either be a global root role (applies to all projects) or a project role',
            type: 'string',
            example: 'root',
        },
        name: {
            description: `The name of the role`,
            type: 'string',
            example: 'Editor',
        },
        description: {
            description: `A more detailed description of the role and what use it's intended for`,
            type: 'string',
            example: `Users with the editor role have access to most features in Unleash but can not manage users and roles in the global scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.`,
        },
        project: {
            description: 'What project the role belongs to',
            type: 'string',
            nullable: true,
            example: 'default',
        },
    },
    components: {},
} as const;

export type RoleSchema = FromSchema<typeof roleSchema>;
