import { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema';

export const featureEventsSchema = {
    $id: '#/components/schemas/featureEventsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['toggleName', 'events'],
    properties: {
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
            ...eventSchema.components.schemas,
        },
    },
} as const;

export type FeatureEventsSchema = FromSchema<typeof featureEventsSchema>;
