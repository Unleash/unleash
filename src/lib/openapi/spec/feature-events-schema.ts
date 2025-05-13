import type { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema.js';
import { tagSchema } from './tag-schema.js';

export const featureEventsSchema = {
    $id: '#/components/schemas/featureEventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['events'],
    description: 'One or more events happening to a specific feature flag',
    properties: {
        version: {
            type: 'integer',
            description: 'An API versioning number',
            minimum: 1,
            enum: [1],
            example: 1,
        },
        toggleName: {
            description: 'The name of the feature flag these events relate to',
            type: 'string',
            example: 'my.first.feature.flag',
        },
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: eventSchema.$id },
        },
        totalEvents: {
            description: 'How many events are there for this feature flag',
            type: 'integer',
            minimum: 0,
            example: 13,
        },
    },
    components: {
        schemas: {
            eventSchema,
            tagSchema,
        },
    },
} as const;

export type FeatureEventsSchema = FromSchema<typeof featureEventsSchema>;
