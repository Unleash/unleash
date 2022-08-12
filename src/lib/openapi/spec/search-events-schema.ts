import { FromSchema } from 'json-schema-to-ts';

export const searchEventsSchema = {
    $id: '#/components/schemas/searchEventsSchema',
    type: 'object',
    description: `
        Search for events by type, project, feature, free-text query,
        or a combination thereof. Pass an empty object to fetch all events.
    `,
    properties: {
        type: {
            type: 'string',
            description: 'Find events by event type (case-sensitive).',
        },
        project: {
            type: 'string',
            description: 'Find events by project ID (case-sensitive).',
        },
        feature: {
            type: 'string',
            description: 'Find events by feature toggle name (case-sensitive).',
        },
        query: {
            type: 'string',
            description: `
                Find events by a free-text search query.
                The query will be matched against the event type,
                the username or email that created the event (if any),
                and the event data payload (if any).
            `,
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
