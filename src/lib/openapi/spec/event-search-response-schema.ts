import type { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema.js';
import { tagSchema } from './tag-schema.js';

export const eventSearchResponseSchema = {
    $id: '#/components/schemas/eventsSearchResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['events', 'total'],
    description: 'A list of events that have been registered by the system',
    properties: {
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: eventSchema.$id },
        },
        total: {
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

export type EventSearchResponseSchema = FromSchema<
    typeof eventSearchResponseSchema
>;
