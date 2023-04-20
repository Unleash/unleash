import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const segmentSchema = {
    $id: '#/components/schemas/segmentSchema',
    type: 'object',
    description:
        'Represents a segment of users defined by a set of constraints.',
    additionalProperties: false,
    required: ['id', 'constraints'],
    properties: {
        id: {
            type: 'number',
            description: "The segment's id.",
        },
        name: {
            type: 'string',
            description: 'The name of the segment.',
            example: 'segment A',
        },
        description: {
            type: 'string',
            nullable: true,
            description: 'The description of the segment.',
            example: 'Segment A description',
        },
        constraints: {
            type: 'array',
            description:
                'List of constraints that determine which users are part of the segment',
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
    },
    components: {
        schemas: {
            constraintSchema,
        },
    },
} as const;

export type SegmentSchema = FromSchema<typeof segmentSchema>;
