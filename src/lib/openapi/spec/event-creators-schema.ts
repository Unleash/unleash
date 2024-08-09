import type { FromSchema } from 'json-schema-to-ts';

export const eventCreatorsSchema = {
    $id: '#/components/schemas/eventCreatorsSchema',
    type: 'array',
    description: 'A list of event creators',
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
                description:
                    "Name of the user. If the user has no set name, the API falls back to using the user's username (if they have one) or email (if neither name or username is set).",
                type: 'string',
                example: 'User',
            },
        },
    },

    components: {
        schemas: {},
    },
} as const;

export type EventCreatorsSchema = FromSchema<typeof eventCreatorsSchema>;
