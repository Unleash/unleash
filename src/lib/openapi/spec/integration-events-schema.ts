import type { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema';
import { tagSchema } from './tag-schema';
import { variantSchema } from './variant-schema';
import { integrationEventSchema } from './integration-event-schema';

export const integrationEventsSchema = {
    $id: '#/components/schemas/integrationEventsSchema',
    description: 'A response model with a list of integration events.',
    type: 'object',
    additionalProperties: false,
    required: ['integrationEvents'],
    properties: {},
    components: {
        schemas: {
            integrationEventSchema,
            eventSchema,
            tagSchema,
            variantSchema,
        },
    },
} as const;

export type IntegrationEventsSchema = FromSchema<
    typeof integrationEventsSchema
>;
