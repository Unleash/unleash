import { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema';
import { tagSchema } from './tag-schema';

export const featureEventsSchema = {
    $id: '#/components/schemas/featureEventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['events'],
    properties: {
        version: { type: 'number' },
        toggleName: {
            type: 'string',
        },
        events: {
            type: 'array',
            items: { $ref: eventSchema.$id },
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
