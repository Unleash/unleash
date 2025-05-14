import type { FromSchema } from 'json-schema-to-ts';
import { eventSchema } from './event-schema.js';
import { tagSchema } from './tag-schema.js';
import { variantSchema } from './variant-schema.js';

export const integrationEventSchema = {
    $id: '#/components/schemas/integrationEventSchema',
    type: 'object',
    required: [
        'id',
        'integrationId',
        'createdAt',
        'state',
        'stateDetails',
        'event',
        'details',
    ],
    description: 'An object describing an integration event.',
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            pattern: '^[0-9]+$', // BigInt
            description:
                "The integration event's ID. Integration event IDs are incrementing integers. In other words, a more recently created integration event will always have a higher ID than an older one. This ID is represented as a string since it is a BigInt.",
            example: '7',
        },
        integrationId: {
            type: 'integer',
            description:
                'The ID of the integration that the integration event belongs to.',
            example: 42,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The date and time of when the integration event was created. In other words, the date and time of when the integration handled the event.',
            example: '2023-12-27T13:37:00+01:00',
        },
        state: {
            type: 'string',
            enum: ['success', 'failed', 'successWithErrors'],
            description:
                'The state of the integration event. Can be one of `success`, `failed` or `successWithErrors`.',
            example: 'failed',
        },
        stateDetails: {
            type: 'string',
            description: 'Details about the state of the integration event.',
            example: 'Status code: 429 - Rate limit reached.',
        },
        event: {
            $ref: eventSchema.$id,
            description: 'The event that triggered this integration event.',
        },
        details: {
            type: 'object',
            'x-enforcer-exception-skip-codes': 'WSCH006',
            description:
                'Detailed information about the integration event. The contents vary depending on the type of integration and the specific details.',
            example: {
                message:
                    '*user@yourcompany.com* created a new *slack-app* integration configuration',
                channels: ['engineering', 'unleash-updates'],
            },
        },
    },
    components: {
        schemas: {
            eventSchema,
            tagSchema,
            variantSchema,
        },
    },
} as const;

export type IntegrationEventSchema = FromSchema<typeof integrationEventSchema>;
