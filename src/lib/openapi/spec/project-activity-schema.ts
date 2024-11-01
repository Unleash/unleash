import type { FromSchema } from 'json-schema-to-ts';

export const projectActivitySchema = {
    $id: '#/components/schemas/projectActivitySchema',
    type: 'array',
    description:
        'An array of project activity information. Each item contains a date and the total number of activities for that date.',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'count'],
        properties: {
            date: {
                type: 'string',
                example: '2022-12-14',
                description: 'Activity date',
            },
            count: {
                type: 'integer',
                minimum: 0,
                description: 'Activity count',
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ProjectActivitySchema = FromSchema<typeof projectActivitySchema>;
