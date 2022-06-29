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
        data: { type: 'object', nullable: true },
        preData: { type: 'object', nullable: true },
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
