import type { FromSchema } from 'json-schema-to-ts';

export const dateSchema = {
    $id: '#/components/schemas/dateSchema',
    description:
        'A representation of a date. Either as a date-time string or as a UNIX timestamp.',
    oneOf: [
        {
            type: 'string',
            format: 'date-time',
            description:
                'An [RFC-3339](https://www.rfc-editor.org/rfc/rfc3339.html)-compliant timestamp.',
            example: '2023-07-27T11:23:44Z',
        },
        {
            type: 'integer',
            description:
                'A [UNIX timestamp](https://en.wikipedia.org/wiki/Unix_time).',
            example: 1690449593,
            minimum: 1,
        },
    ],
    components: {},
} as const;

export type DateSchema = FromSchema<typeof dateSchema>;
