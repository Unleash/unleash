import type { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema.js';
import { tagSchema } from './tag-schema.js';

export const eventsSchema = {
    $id: '#/components/schemas/eventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'events'],
    description: 'A list of events that has happened in the system',
    properties: {
        version: {
            type: 'integer',
            minimum: 1,
            enum: [1],
            description:
                'The api version of this response. A natural increasing number. Only increases if format changes',
            example: 1,
        },
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: eventSchema.$id },
        },
        totalEvents: {
            type: 'integer',
            description: 'The total count of events',
            minimum: 0,
            example: 842,
        },
    },
    components: {
        schemas: {
            eventSchema,
            tagSchema,
        },
    },
} as const;

export type EventsSchema = FromSchema<typeof eventsSchema>;
