import type { FromSchema } from 'json-schema-to-ts';
import { IEventTypes } from '../../types';

export const deprecatedSearchEventsSchema = {
    $id: '#/components/schemas/deprecatedSearchEventsSchema',
    type: 'object',
    description: `
        Search for events by type, project, feature, free-text query,
        or a combination thereof. Pass an empty object to fetch all events.
    `,
    properties: {
        type: {
            type: 'string',
            description: 'Find events by event type (case-sensitive).',
            enum: IEventTypes,
            example: 'feature-created',
        },
        project: {
            type: 'string',
            description: 'Find events by project ID (case-sensitive).',
            example: 'default',
        },
        feature: {
            type: 'string',
            description: 'Find events by feature flag name (case-sensitive).',
            example: 'my.first.flag',
        },
        query: {
            type: 'string',
            description: `Find events by a free-text search query. The query will be matched against the event type, the username or email that created the event (if any), and the event data payload (if any).`,
            example: 'admin@example.com',
        },
        limit: {
            type: 'integer',
            description:
                'The maximum amount of events to return in the search result',
            minimum: 1,
            maximum: 100,
            default: 100,
            example: 50,
        },
        offset: {
            description: 'Which event id to start listing from',
            type: 'integer',
            minimum: 0,
            default: 0,
            example: 100,
        },
    },
    components: {},
} as const;

export type DeprecatedSearchEventsSchema = FromSchema<
    typeof deprecatedSearchEventsSchema
>;
