import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';
import { variantSchema } from './variant-schema';

const eventDataSchema = {
    type: 'object',
    additionalProperties: true,
    properties: {
        name: {
            type: 'string',
            description:
                'Name of the feature toggle/strategy/environment that this event relates to',
            example: 'my.first.toggle',
        },
        description: {
            type: 'string',
            description: 'The description of the object this event relates to',
            example: 'Toggle description',
        },
        type: {
            type: 'string',
            description:
                'If this event relates to a feature toggle, the type of feature toggle.',
            example: 'release',
        },
        project: {
            type: 'string',
            description: 'The project this event relates to',
            example: 'default',
        },
        stale: {
            description: 'Is the feature toggle this event relates to stale',
            type: 'boolean',
            example: true,
        },
        variants: {
            description: 'Variants configured for this toggle',
            type: 'array',
            items: {
                $ref: '#/components/schemas/variantSchema',
            },
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The time the event happened as a RFC 3339-conformant timestamp.',
            example: '2023-07-05T12:56:00.000Z',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            description: 'The time the feature was last seen',
            example: '2023-07-05T12:56:00.000Z',
            nullable: true,
        },
        impressionData: {
            description:
                'Should [impression events](https://docs.getunleash.io/reference/impression-data) activate for this feature toggle',
            type: 'boolean',
            example: false,
        },
    },
    description:
        'Extra associated data related to the event, such as feature toggle state, segment configuration, etc., if applicable.',
    example: {
        name: 'new-feature',
        description: 'Toggle description',
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
                'What [type](https://docs.getunleash.io/reference/api/legacy/unleash/admin/events#event-type-description) of event this is',
            example: 'feature-created',
        },
        createdBy: {
            type: 'string',
            description: 'Which user created this event',
            example: 'johndoe',
        },
        environment: {
            type: 'string',
            description:
                'The feature toggle environment the event relates to, if applicable.',
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
                'The name of the feature toggle the event relates to, if applicable.',
            example: 'my.first.feature',
        },
        data: eventDataSchema,
        preData: {
            ...eventDataSchema,
            description:
                "Data relating to the previous state of the event's subject.",
            nullable: true,
        },
        tags: {
            type: 'array',
            items: {
                $ref: tagSchema.$id,
            },
            nullable: true,
            description: 'Any tags related to the event, if applicable.',
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
