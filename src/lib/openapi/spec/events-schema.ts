import { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema';
import { tagSchema } from './tag-schema';

export const eventsSchema = {
    $id: '#/components/schemas/eventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'events'],
    properties: {
        version: {
            type: 'integer',
            minimum: 1,
        },
        events: {
            type: 'array',
            items: { $ref: eventSchema.$id },
        },
        totalEvents: {
            type: 'integer',
            minimum: 0,
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
