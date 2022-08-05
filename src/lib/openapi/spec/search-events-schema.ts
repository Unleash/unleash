import { FromSchema } from 'json-schema-to-ts';

export const searchEventsSchema = {
    $id: '#/components/schemas/searchEventsSchema',
    type: 'object',
    properties: {
        type: {
            type: 'string',
        },
        project: {
            type: 'string',
        },
        feature: {
            type: 'string',
        },
        query: {
            type: 'string',
        },
        limit: {
            type: 'number',
        },
        offset: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type SearchEventsSchema = FromSchema<typeof searchEventsSchema>;
