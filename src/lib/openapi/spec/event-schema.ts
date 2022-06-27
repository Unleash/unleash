import { FromSchema } from 'json-schema-to-ts';
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
        },
        project: {
            type: 'string',
        },
        featureName: {
            type: 'string',
        },
        data: {},
        preData: {},
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type EventSchema = FromSchema<typeof eventSchema>;
