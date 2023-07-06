import { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema';
import { tagSchema } from './tag-schema';

export const featureEventsSchema = {
    $id: '#/components/schemas/featureEventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['events'],
    description: 'One or more events happening to a specific feature toggle',
    properties: {
        version: {
            type: 'integer',
            description: 'An API versioning number',
            minimum: 1,
            enum: [1],
            example: 1,
        },
        toggleName: {
            description:
                'The name of the feature toggle these events relate to',
            type: 'string',
            example: 'my.first.feature.toggle',
        },
        events: {
            description: 'The list of events',
            type: 'array',
            items: { $ref: eventSchema.$id },
        },
        totalEvents: {
            description: 'How many events are there for this feature toggle',
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
