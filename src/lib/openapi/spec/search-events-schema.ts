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
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 100,
        },
        offset: {
            type: 'integer',
            minimum: 0,
            default: 0,
        },
    },
    components: {},
} as const;

export type SearchEventsSchema = FromSchema<typeof searchEventsSchema>;
