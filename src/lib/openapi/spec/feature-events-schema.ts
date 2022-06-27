import { FromSchema } from 'json-schema-to-ts';
import { includeSchemasRecursively } from '../nested-schemas';
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
        schemas: includeSchemasRecursively({
            eventSchema,
        }),
    },
} as const;

export type FeatureEventsSchema = FromSchema<typeof featureEventsSchema>;
