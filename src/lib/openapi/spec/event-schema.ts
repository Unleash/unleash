import { FromSchema } from 'json-schema-to-ts';
import { FEATURE_CREATED, FEATURE_UPDATED } from '../../../lib/types/events';
import { tagSchema } from './tag-schema';

export const eventSchema = {
    $id: '#/components/schemas/eventSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'createdAt', 'type', 'createdBy'],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        type: {
            type: 'string',
        },
        createdBy: {
            type: 'string',
        },
        environment: {
            type: 'string',
            nullable: true,
        },
        project: {
            type: 'string',
            nullable: true,
        },
        featureName: {
            type: 'string',
            nullable: true,
        },
        data: {},
        preData: {},
        tags: {
            type: 'array',
            items: {
                $ref: tagSchema.$id,
            },
            nullable: true,
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type EventSchema = FromSchema<typeof eventSchema>;

export const eventBaseSchema = {
    $id: '#/components/schemas/eventBaseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'createdAt', 'type', 'createdBy'],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            description: 'The ID of the event.',
            example: 42,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the event ocurred.',
            example: '2022-06-29T13:29:48Z',
        },
        createdBy: {
            type: 'string',
            description:
                'The username or email of the person who triggered the event.',
            example: 'user@company.com',
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

const getEventTypeProperty = (eventType: string) => ({
    type: 'string',
    enum: [eventType],
    description: 'The type of the event.',
    example: eventType,
});

type EventData = {
    type: string;
    required: string[];
    properties: {};
    description: string;
};
const createEvent = (e: EventData) => ({
    $id: `#/components/schemas/${e.type}EventSchema`,
    allOf: [
        { $ref: eventBaseSchema.$id },
        {
            type: 'object',
            additionalProperties: false,
            required: ['type', ...e.required],
            description:
                'This event fires when you create a feature. The `data` property contains the details for the new feature.',
            properties: {
                type: getEventTypeProperty(e.type),
            },
        },
    ],
    components: {},
});

export const featureCreatedEventSchema = createEvent({
    type: FEATURE_CREATED,
    description: 'blu',
    required: ['other prop'],
    properties: {
        'other prop': { type: 'string' },
    },
});

// export const featureCreatedEventSchema = {
//     $id: '#/components/schemas/featureCreatedEventSchema',
//     allOf: [
//         { $ref: eventBaseSchema.$id },
//         {
//             type: 'object',
//             additionalProperties: false,
//             required: ['type'],
//             description:
//                 'This event fires when you create a feature. The `data` property contains the details for the new feature.',
//             properties: {
//                 type: getEventTypeProperty(FEATURE_CREATED),
//             },
//         },
//     ],
//     components: {},
// };

export const featureUpdatedEventSchema = {
    $id: '#/components/schemas/featureUpdatedEventSchema',
    allOf: [
        { $ref: eventBaseSchema.$id },
        {
            type: 'object',
            additionalProperties: false,
            required: ['type'],
            deprecated: true,
            description:
                'This event fires when a feature gets updated in some way. The `data` property contains the new state of the toggle. This is a legacy event, so it does not populate `preData` property.\n\nThis event type was replaced by more granular event types in Unleash 4.3.',
            properties: {
                type: getEventTypeProperty(FEATURE_UPDATED),
            },
        },
    ],
    components: {},
};

export const eventCollectedSchema = {
    $id: '#/components/schemas/eventCollectedSchema',
    oneOf: [{ $ref: featureCreatedEventSchema.$id }],
    components: {
        schemas: {
            tagSchema,
            featureCreatedEventSchema,
        },
    },
} as const;

export type EventCollectedSchema = FromSchema<typeof eventCollectedSchema>;
