import type { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema.js';
import { IEventTypes } from '../../events/index.js';
import { variantSchema } from './variant-schema.js';

const eventDataSchema = {
    type: 'object',
    nullable: true,
    'x-enforcer-exception-skip-codes': 'WSCH006', // allow additional properties in example (openapi enforcer)
    description:
        'Extra associated data related to the event, such as feature flag state, segment configuration, etc., if applicable.',
    example: {
        name: 'new-feature',
        description: 'Flag description',
        type: 'release',
        project: 'my-project',
        stale: false,
        variants: [],
        createdAt: '2022-05-31T13:32:20.547Z',
        lastSeenAt: null,
        impressionData: true,
    },
} as const;
export const eventSchema = {
    $id: '#/components/schemas/eventSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'createdAt', 'type', 'createdBy'],
    description: 'An event describing something happening in the system',
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            description: 'The ID of the event. An increasing natural number.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The time the event happened as a RFC 3339-conformant timestamp.',
            example: '2023-07-05T12:56:00.000Z',
        },
        type: {
            type: 'string',
            description:
                'What [type](https://docs.getunleash.io/concepts/events#event-types) of event this is',
            enum: IEventTypes,
            example: 'feature-created',
        },
        createdBy: {
            type: 'string',
            description: 'Which user created this event',
            example: 'johndoe',
        },
        createdByUserId: {
            type: 'number',
            description: 'The is of the user that created this event',
            example: 1337,
            nullable: true,
        },
        environment: {
            type: 'string',
            description:
                'The feature flag environment the event relates to, if applicable.',
            nullable: true,
            example: 'development',
        },
        project: {
            type: 'string',
            nullable: true,
            description: 'The project the event relates to, if applicable.',
            example: 'default',
        },
        featureName: {
            type: 'string',
            nullable: true,
            description:
                'The name of the feature flag the event relates to, if applicable.',
            example: 'my.first.feature',
        },
        data: eventDataSchema,
        preData: {
            ...eventDataSchema,
            description:
                "Data relating to the previous state of the event's subject.",
        },
        tags: {
            type: 'array',
            items: {
                $ref: tagSchema.$id,
            },
            nullable: true,
            description: 'Any tags related to the event, if applicable.',
        },
        label: {
            type: 'string',
            nullable: true,
            description: 'The concise, human-readable name of the event.',
        },
        summary: {
            type: 'string',
            nullable: true,
            description: 'A markdown-formatted summary of the event.',
        },
        ip: {
            type: 'string',
            nullable: true,
            description:
                'The IP address of the user that created the event. Only available in Enterprise.',
            example: '192.168.1.1',
        },
        groupType: {
            type: 'string',
            description:
                'The type of transaction group this event belongs to, if applicable.',
            example: 'change-request',
        },
        groupId: {
            type: 'string',
            description:
                'The unique identifier for the transaction group this event belongs to, if applicable.',
            example: '01HQVX5K8P9EXAMPLE123456',
        },
    },
    components: {
        schemas: {
            tagSchema,
            variantSchema,
        },
    },
} as const;

export type EventSchema = FromSchema<typeof eventSchema>;
