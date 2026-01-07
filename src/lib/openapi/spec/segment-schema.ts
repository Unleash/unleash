import type { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema.js';
import { clientSegmentSchema } from './client-segment-schema.js';

export const segmentSchema = {
    $id: '#/components/schemas/segmentSchema',
    type: 'object',
    description:
        'Represents a segment of users defined by a set of constraints.',
    additionalProperties: false,
    required: ['id', 'constraints'],
    properties: {
        ...clientSegmentSchema.properties,
        description: {
            type: 'string',
            nullable: true,
            description: 'The description of the segment.',
            example: 'Segment A description',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description:
                'The time the segment was created as a RFC 3339-conformant timestamp.',
            example: '2023-07-05T12:56:00.000Z',
        },
        createdBy: {
            type: 'string',
            description: 'Which user created this segment',
            example: 'johndoe',
        },
        project: {
            type: 'string',
            nullable: true,
            description: 'The project the segment relates to, if applicable.',
            example: 'default',
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type SegmentSchema = FromSchema<
    typeof segmentSchema,
    { keepDefaultedPropertiesOptional: true }
>;
