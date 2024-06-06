import type { FromSchema } from 'json-schema-to-ts';

export const projectFlagCreatorsSchema = {
    $id: '#/components/schemas/projectFlagCreatorsSchema',
    type: 'array',
    description: 'A list of project flag creators',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name'],
        properties: {
            id: {
                type: 'integer',
                example: 50,
                description: 'The user id.',
            },
            name: {
                description: 'Name of the user',
                type: 'string',
                example: 'User',
            },
        },
    },

    components: {
        schemas: {},
    },
} as const;

export type ProjectFlagCreatorsSchema = FromSchema<
    typeof projectFlagCreatorsSchema
>;
