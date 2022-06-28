import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';

export const segmentSchema = {
    $id: '#/components/schemas/segmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'constraints'],
    properties: {
        id: {
            type: 'number',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
            nullable: true,
        },
        constraints: {
            type: 'array',
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
