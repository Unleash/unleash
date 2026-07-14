import type { FromSchema } from 'json-schema-to-ts';

export const flagCreatorsSchema = {
    $id: '#/components/schemas/flagCreatorsSchema',
    type: 'object',
    description:
        'A paginated list of users who have created flags across accessible projects.',
    required: ['flagCreators', 'total'],
    properties: {
        total: {
            type: 'integer',
            example: 50,
            description:
                'The total number of flag creators matching the search and access filters.',
        },
        flagCreators: {
            type: 'array',
            description: 'The flag creators returned in the current page.',
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
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type FlagCreatorsSchema = FromSchema<typeof flagCreatorsSchema>;
